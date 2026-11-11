import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { createServer } from "../src/server";

const RULES = "Work with humans.";

describe("BecomeHuman MCP server", () => {
  let client: Client;

  beforeEach(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "test-client", version: "1.0.0" });

    await createServer(RULES).connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
  });

  it("sends the rules as instructions on connect", () => {
    expect(client.getInstructions()).toBe(RULES);
  });

  it("lists only the get_rules tool", async () => {
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name)).toEqual(["get_rules"]);
  });

  it("returns the rules from get_rules", async () => {
    const result = await client.callTool({ name: "get_rules", arguments: {} });

    expect(result.content).toEqual([{ type: "text", text: RULES }]);
  });
});
