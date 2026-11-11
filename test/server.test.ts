import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { Language } from "../src/i18n";
import { createServer } from "../src/server";
import { tempFolder } from "./helpers";

const RULES = "Work with humans.";

async function connect(folder: string, lang: Language = "en"): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "1.0.0" });

  await createServer({ rules: RULES, folder, project: "demo", lang }).connect(serverTransport);
  await client.connect(clientTransport);

  return client;
}

async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args });

  return (result.content as { text: string }[])[0].text;
}

describe("BecomeHuman MCP server", () => {
  let folder: ReturnType<typeof tempFolder>;
  let client: Client;

  beforeEach(async () => {
    folder = tempFolder();
    client = await connect(folder.path);
  });

  afterEach(async () => {
    await client.close();
    folder.remove();
  });

  async function nextSession(lang?: Language): Promise<Client> {
    await client.close();
    client = await connect(folder.path, lang);

    return client;
  }

  it("sends rules and an empty profile as instructions", () => {
    expect(client.getInstructions()).toBe(
      `${RULES}\n\n## What you already know about your operator\n\nNothing learned yet. Learn as you go.`,
    );
  });

  it("creates the personal rules template for the human", () => {
    const filePath = join(folder.path, "my-rules.md");

    expect(existsSync(filePath)).toBe(true);
    expect(readFileSync(filePath, "utf8")).toContain("# My rules");
  });

  it("adds the human's own rules right after the base rules", async () => {
    writeFileSync(join(folder.path, "my-rules.md"), "# My rules\n\n- Answer in Portuguese.\n");

    const session = await nextSession();

    expect(session.getInstructions()).toContain(
      `${RULES}\n\n## Your operator's own rules (they win over the rules above)\n\n# My rules`,
    );
  });

  it("lists every tool", async () => {
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name).sort()).toEqual([
      "forget",
      "get_map",
      "get_profile",
      "get_rules",
      "map_add",
      "map_resolve",
      "remember",
      "where_is_my_data",
    ]);
  });

  it("returns the rules from get_rules", async () => {
    expect(await call(client, "get_rules")).toBe(RULES);
  });

  it("remembers, lists and forgets facts", async () => {
    expect(await call(client, "remember", { category: "code", fact: "Uses Jest" })).toBe(
      "Learned: [Code] Uses Jest",
    );
    expect(await call(client, "get_profile")).toBe("1. [Code] Uses Jest");
    expect(await call(client, "forget", { number: 1 })).toBe("Forgot: Uses Jest");
    expect(await call(client, "forget", { number: 1 })).toBe("There is no fact #1.");
  });

  it("writes the profile in the configured language", async () => {
    const session = await nextSession("pt");

    await call(session, "remember", { category: "code", fact: "Usa Jest" });

    expect(readFileSync(join(folder.path, "profile.md"), "utf8")).toBe(
      "# O que aprendi sobre você\n\n## Código\n- Usa Jest\n",
    );
  });

  it("brings learned facts into the next session", async () => {
    await call(client, "remember", { category: "tone", fact: "Short answers" });

    expect((await nextSession()).getInstructions()).toContain("1. [Tone] Short answers");
  });

  it("rejects an unknown category", async () => {
    const result = await client.callTool({
      name: "remember",
      arguments: { category: "secret", fact: "X" },
    });

    expect(result.isError).toBe(true);
  });

  it("builds and resolves an idea map", async () => {
    expect(await call(client, "map_add", { project: "demo", kind: "next", text: "Ship" })).toBe(
      "Added #1 (next): Ship",
    );
    expect(await call(client, "get_map", { project: "demo" })).toContain("- #1 Ship");
    expect(await call(client, "map_resolve", { project: "demo", id: 1 })).toBe("Resolved #1: Ship");
    expect(await call(client, "get_map", { project: "demo" })).toContain("Nothing open.");
  });

  it("brings the current project's map into the next session", async () => {
    await call(client, "map_add", { project: "demo", kind: "next", text: "Ship v0.4" });

    const instructions = (await nextSession()).getInstructions();

    expect(instructions).toContain("## Current project: demo");
    expect(instructions).toContain("- #1 Ship v0.4");
  });

  it("leaves other projects' maps out of the instructions", async () => {
    await call(client, "map_add", { project: "other", kind: "next", text: "Elsewhere" });

    expect((await nextSession()).getInstructions()).not.toContain("Elsewhere");
  });

  it("reports a missing idea as a tool error", async () => {
    const result = await client.callTool({ name: "map_resolve", arguments: { project: "demo", id: 7 } });

    expect(result.isError).toBe(true);
  });

  it("tells where every file lives", async () => {
    const answer = await call(client, "where_is_my_data");

    expect(answer).toContain(`Folder: ${folder.path}`);
    expect(answer).toContain(join(folder.path, "profile.md"));
    expect(answer).toContain(join(folder.path, "my-rules.md"));
    expect(answer).toContain(join(folder.path, "maps"));
  });
});
