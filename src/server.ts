import { basename } from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { dataDir, language, profileLimit } from "./config";
import { writeIfMissing } from "./files";
import { Language, labels as labelsFor } from "./i18n";
import { IdeaMaps } from "./ideaMap/ideaMap";
import { dataPaths } from "./paths";
import { formatProfile, Profile } from "./profile/profile";
import { loadPersonalRules, loadRules } from "./rules";
import { registerDataTools } from "./tools/dataTools";
import { registerMapTools } from "./tools/mapTools";
import { registerProfileTools } from "./tools/profileTools";
import { text } from "./tools/text";

const SERVER_INFO = { name: "become-human", version: "0.6.0" };

export interface ServerOptions {
  rules?: string;
  folder?: string;
  project?: string;
  lang?: Language;
  limit?: number;
}

export function createServer({
  rules = loadRules(),
  folder = dataDir(),
  project = basename(process.cwd()),
  lang = language(),
  limit = profileLimit(),
}: ServerOptions = {}): McpServer {
  const labels = labelsFor(lang);
  const paths = dataPaths(folder);
  const profile = new Profile(paths.profile, labels.profileTitle);
  const maps = new IdeaMaps(paths.maps);

  writeIfMissing(paths.myRules, labels.myRulesTemplate);

  const instructions = [
    rules,
    ...personalRules(paths.myRules),
    "## What you already know about your operator",
    formatProfile(profile.list()),
    ...currentMap(maps, project),
  ].join("\n\n");

  const server = new McpServer(SERVER_INFO, { instructions });

  server.registerTool(
    "get_rules",
    { description: "Reread the rules for working with your human." },
    async () => text(rules),
  );

  registerProfileTools(server, { profile, labels, limit });
  registerMapTools(server, maps);
  registerDataTools(server, paths);

  return server;
}

function personalRules(filePath: string): string[] {
  const content = loadPersonalRules(filePath);

  return content ? ["## Your operator's own rules (they win over the rules above)", content] : [];
}

function currentMap(maps: IdeaMaps, project: string): string[] {
  const openItems = maps.openItems(project);

  return openItems ? [openItems] : [];
}
