import { readFileSync } from "node:fs";
import { join } from "node:path";

import { dataDir } from "./config";

const ART_FILE = join(__dirname, "..", "art", "creation.txt");
const REPO_URL = "https://github.com/DanielDDHM/become-human";

export function banner(folder: string = dataDir()): string {
  return [
    readFileSync(ART_FILE, "utf8"),
    "BecomeHuman is an MCP server: your agent starts it by itself, you don't.",
    "",
    "Add it once to Claude Code:",
    `  claude mcp add become-human --scope user -- npx -y become-human`,
    "",
    `Other agents: ${REPO_URL}#install`,
    `Your files:   ${folder}`,
    "",
  ].join("\n");
}
