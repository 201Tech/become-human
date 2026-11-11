import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function readText(filePath: string): string | undefined {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : undefined;
}

// shortcut: last write wins, upgrade to a lock if parallel sessions start losing data
export function writeText(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

export function writeIfMissing(filePath: string, content: string): void {
  if (!existsSync(filePath)) writeText(filePath, content);
}
