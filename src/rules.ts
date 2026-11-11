import { readFileSync } from "node:fs";
import { join } from "node:path";

import { readText } from "./files";

const RULES_FILE = join(__dirname, "..", "rules", "human-first.md");
const HTML_COMMENTS = /<!--[\s\S]*?-->/g;
const HEADING_ONLY = /^#.*$/gm;

export function loadRules(filePath: string = RULES_FILE): string {
  return readFileSync(filePath, "utf8").trim();
}

export function loadPersonalRules(filePath: string): string | undefined {
  const content = (readText(filePath) ?? "").replace(HTML_COMMENTS, "");
  const hasRules = content.replace(HEADING_ONLY, "").trim().length > 0;

  return hasRules ? content.trim() : undefined;
}
