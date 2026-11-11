import { readText, writeText } from "./files";

export function readLines(filePath: string): string[] | undefined {
  return readText(filePath)?.replace(/\n+$/, "").split("\n");
}

export function writeLines(filePath: string, lines: string[]): void {
  writeText(filePath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
}

export function lastFilledLine(lines: string[], from: number, to: number): number {
  for (let index = to - 1; index > from; index--) {
    if (lines[index].trim()) return index;
  }

  return from;
}
