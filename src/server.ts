import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { loadRules } from "./rules";

const SERVER_INFO = { name: "become-human", version: "0.1.0" };

export function createServer(rules: string = loadRules()): McpServer {
  const server = new McpServer(SERVER_INFO, { instructions: rules });

  server.registerTool(
    "get_rules",
    {
      title: "Human-first working rules",
      description:
        "Returns the rules for working with and for a human partner. " +
        "Read them before starting a task and whenever unsure how to proceed.",
    },
    async () => ({ content: [{ type: "text", text: rules }] }),
  );

  return server;
}
