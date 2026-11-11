import { readFileSync } from "node:fs";
import { join } from "node:path";

const ART_FILE = join(__dirname, "..", "art", "creation.txt");

const USAGE = [
  "BecomeHuman is an MCP server: your agent starts it, not you.",
  "",
  "Add it to Claude Code:",
  "  claude mcp add become-human --scope user -- npx -y github:DanielDDHM/BecomeHuman",
  "",
  "Other agents: https://github.com/DanielDDHM/BecomeHuman#install",
].join("\n");

export function banner(): string {
  return `${readFileSync(ART_FILE, "utf8")}\n${USAGE}\n`;
}
