import { readText, writeText } from "../files";

export const CATEGORIES = [
  "workflow",
  "communication",
  "code",
  "decisions",
  "learning",
  "tone",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ProfileEntry {
  category: string;
  fact: string;
}

const HEADER = "# What I learned about my operator";
const ENTRY_LINE = /^- \*\*(.+?):\*\* (.+)$/;

export class Profile {
  constructor(private readonly filePath: string) {}

  list(): ProfileEntry[] {
    const content = readText(this.filePath) ?? "";

    return content.split("\n").flatMap(parseEntry);
  }

  add(entry: ProfileEntry): void {
    this.save([...this.list(), entry]);
  }

  forget(position: number): ProfileEntry | undefined {
    const entries = this.list();
    const [removed] = entries.splice(position - 1, 1);

    if (removed) this.save(entries);

    return removed;
  }

  private save(entries: ProfileEntry[]): void {
    const lines = entries.map(({ category, fact }) => `- **${category}:** ${fact}`);

    writeText(this.filePath, [HEADER, "", ...lines, ""].join("\n"));
  }
}

function parseEntry(line: string): ProfileEntry[] {
  const match = ENTRY_LINE.exec(line.trim());

  return match ? [{ category: match[1], fact: match[2] }] : [];
}

export function formatProfile(entries: ProfileEntry[]): string {
  if (entries.length === 0) return "Nothing learned yet. Learn as you go.";

  return entries
    .map(({ category, fact }, index) => `${index + 1}. [${category}] ${fact}`)
    .join("\n");
}
