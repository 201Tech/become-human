import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { createServer } from "../src/server";
import { tempFolder } from "./helpers";

const RULES = "Work with humans.";

async function connect(folder: string): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "1.0.0" });

  await createServer({ rules: RULES, folder }).connect(serverTransport);
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

  it("sends rules and an empty profile as instructions", () => {
    expect(client.getInstructions()).toBe(
      `${RULES}\n\n## What you already know about your operator\n\nNothing learned yet. Learn as you go.`,
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
    ]);
  });

  it("returns the rules from get_rules", async () => {
    expect(await call(client, "get_rules")).toBe(RULES);
  });

  it("remembers, lists and forgets facts", async () => {
    expect(await call(client, "remember", { category: "code", fact: "Uses Jest" })).toBe(
      "Learned: [code] Uses Jest",
    );
    expect(await call(client, "get_profile")).toBe("1. [code] Uses Jest");
    expect(await call(client, "forget", { number: 1 })).toBe("Forgot: Uses Jest");
    expect(await call(client, "forget", { number: 1 })).toBe("There is no fact #1.");
  });

  it("brings learned facts into the next session", async () => {
    await call(client, "remember", { category: "tone", fact: "Short answers" });

    const nextSession = await connect(folder.path);

    expect(nextSession.getInstructions()).toContain("1. [tone] Short answers");

    await nextSession.close();
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

  it("reports a missing idea as a tool error", async () => {
    const result = await client.callTool({ name: "map_resolve", arguments: { project: "demo", id: 7 } });

    expect(result.isError).toBe(true);
  });
});
