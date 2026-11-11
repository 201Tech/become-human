import { IdeaNode, NodeKind } from "./types";

const OPEN_SECTIONS: { kind: NodeKind; title: string }[] = [
  { kind: "next", title: "Next steps" },
  { kind: "question", title: "Open questions" },
];

export function summarize(nodes: IdeaNode[]): string {
  const open = nodes.filter((node) => !node.resolved);
  const sections = OPEN_SECTIONS.flatMap(({ kind, title }) => section(title, open, kind));

  return ["## Where we left off", ...(sections.length > 0 ? sections : ["Nothing open."])].join("\n\n");
}

function section(title: string, nodes: IdeaNode[], kind: NodeKind): string[] {
  const items = nodes.filter((node) => node.kind === kind);

  if (items.length === 0) return [];

  return [`### ${title}\n\n${items.map((node) => `- #${node.id} ${node.text}`).join("\n")}`];
}
