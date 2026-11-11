import { readFileSync } from "node:fs";
import { join } from "node:path";

const RULES_FILE = join(__dirname, "..", "rules", "human-first.md");

export function loadRules(filePath: string = RULES_FILE): string {
  return readFileSync(filePath, "utf8").trim();
}
