import { join } from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { dataDir } from "./config";
import { IdeaMaps } from "./ideaMap/ideaMap";
import { formatProfile, Profile } from "./profile/profile";
import { loadRules } from "./rules";
import { registerMapTools } from "./tools/mapTools";
import { registerProfileTools } from "./tools/profileTools";
import { text } from "./tools/text";

const SERVER_INFO = { name: "become-human", version: "0.2.0" };

export interface ServerOptions {
  rules?: string;
  folder?: string;
}

export function createServer({ rules = loadRules(), folder = dataDir() }: ServerOptions = {}): McpServer {
  const profile = new Profile(join(folder, "profile.md"));
  const maps = new IdeaMaps(join(folder, "maps"));

  const instructions = [
    rules,
    "## What you already know about your operator",
    formatProfile(profile.list()),
  ].join("\n\n");

  const server = new McpServer(SERVER_INFO, { instructions });

  server.registerTool(
    "get_rules",
    {
      title: "Human-first working rules",
      description:
        "Returns the rules for working with and for a human partner. " +
        "Read them before starting a task and whenever unsure how to proceed.",
    },
    async () => text(rules),
  );

  registerProfileTools(server, profile);
  registerMapTools(server, maps);

  return server;
}
