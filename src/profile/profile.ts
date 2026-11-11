import { readText, writeText } from "../files";

export interface ProfileEntry {
  topic: string;
  fact: string;
}

const TOPIC_HEADING = /^##\s+(.+)$/;
const FACT_BULLET = /^[-*]\s+(.+)$/;

export class Profile {
  constructor(
    private readonly filePath: string,
    private readonly title: string,
  ) {}

  list(): ProfileEntry[] {
    return parseProfile(readText(this.filePath) ?? "");
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
    writeText(this.filePath, serializeProfile(this.title, entries));
  }
}

export function parseProfile(content: string): ProfileEntry[] {
  const entries: ProfileEntry[] = [];
  let topic: string | undefined;

  for (const line of content.split("\n").map((current) => current.trim())) {
    const heading = TOPIC_HEADING.exec(line);
    const bullet = FACT_BULLET.exec(line);

    if (heading) topic = heading[1];
    else if (bullet && topic) entries.push({ topic, fact: bullet[1] });
  }

  return entries;
}

function serializeProfile(title: string, entries: ProfileEntry[]): string {
  const topics = [...new Set(entries.map((entry) => entry.topic))];

  const sections = topics.map((topic) => {
    const facts = entries.filter((entry) => entry.topic === topic).map((entry) => `- ${entry.fact}`);

    return [`## ${topic}`, ...facts].join("\n");
  });

  return [`# ${title}`, ...sections].join("\n\n") + "\n";
}

export function formatProfile(entries: ProfileEntry[]): string {
  if (entries.length === 0) return "Nothing learned yet. Learn as you go.";

  return entries.map(({ topic, fact }, index) => `${index + 1}. [${topic}] ${fact}`).join("\n");
}
