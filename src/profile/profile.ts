import { lastFilledLine, readLines, writeLines } from "../lines";

export interface ProfileEntry {
  topic: string;
  fact: string;
}

interface LocatedEntry extends ProfileEntry {
  line: number;
}

export interface ForgetResult {
  removed?: ProfileEntry;
  matches: ProfileEntry[];
}

const TOPIC_HEADING = /^##\s+(.+)$/;
const FACT_BULLET = /^[-*]\s+(.+)$/;

// Writes touch only the lines that change, so anything the human wrote stays in place.
export class Profile {
  constructor(
    private readonly filePath: string,
    private readonly title: string,
  ) {}

  list(): ProfileEntry[] {
    return locate(this.read()).map(({ topic, fact }) => ({ topic, fact }));
  }

  has(entry: ProfileEntry): boolean {
    const same = (current: ProfileEntry) =>
      sameText(current.topic, entry.topic) && sameText(current.fact, entry.fact);

    return this.list().some(same);
  }

  add({ topic, fact }: ProfileEntry): void {
    const lines = this.read();
    const heading = lines.findIndex((line) => sameText(TOPIC_HEADING.exec(line.trim())?.[1], topic));

    if (heading === -1) {
      lines.push("", `## ${topic}`, `- ${fact}`);
    } else {
      lines.splice(lastFilledLine(lines, heading, sectionEnd(lines, heading)) + 1, 0, `- ${fact}`);
    }

    writeLines(this.filePath, lines);
  }

  forget(query: string): ForgetResult {
    const lines = this.read();
    const matches = locate(lines).filter((entry) => entry.fact.toLowerCase().includes(query.toLowerCase()));
    const plain = matches.map(({ topic, fact }) => ({ topic, fact }));

    if (matches.length !== 1) return { matches: plain };

    lines.splice(matches[0].line, 1);
    writeLines(this.filePath, lines);

    return { removed: plain[0], matches: plain };
  }

  private read(): string[] {
    return readLines(this.filePath) ?? [`# ${this.title}`];
  }
}

function locate(lines: string[]): LocatedEntry[] {
  const entries: LocatedEntry[] = [];
  let topic: string | undefined;

  lines.forEach((raw, line) => {
    const text = raw.trim();
    const heading = TOPIC_HEADING.exec(text);
    const bullet = FACT_BULLET.exec(text);

    if (heading) topic = heading[1];
    else if (bullet && topic) entries.push({ topic, fact: bullet[1], line });
  });

  return entries;
}

function sectionEnd(lines: string[], heading: number): number {
  const next = lines.findIndex((line, index) => index > heading && line.trim().startsWith("#"));

  return next === -1 ? lines.length : next;
}

function sameText(left: string | undefined, right: string): boolean {
  return left?.trim().toLowerCase() === right.trim().toLowerCase();
}

export function formatProfile(entries: ProfileEntry[]): string {
  if (entries.length === 0) return "Nothing learned yet. Learn as you go.";

  const topics = [...new Set(entries.map((entry) => entry.topic))];

  return topics
    .map((topic) => {
      const facts = entries.filter((entry) => entry.topic === topic).map((entry) => entry.fact);

      return `${topic}: ${facts.join("; ")}`;
    })
    .join("\n");
}
