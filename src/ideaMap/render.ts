import { IdeaMapData, IdeaNode, NodeKind } from "./types";

const ICONS: Record<NodeKind, string> = {
  idea: "💡",
  decision: "✅",
  question: "❓",
  next: "➡️",
};

const OPEN_SECTIONS: { kind: NodeKind; title: string }[] = [
  { kind: "next", title: "Next steps" },
  { kind: "question", title: "Open questions" },
];

const MERMAID_BREAKING = /[()[\]{}"`]/g;
const BASE_INDENT = 2;
const INDENT_STEP = 2;

export function renderMap(map: IdeaMapData): string {
  return [
    `# Idea map: ${map.project}`,
    "",
    `Updated ${map.updatedAt}`,
    "",
    "```mermaid",
    "mindmap",
    `${indent(BASE_INDENT)}root((${clean(map.project)}))`,
    ...renderChildren(map.nodes, undefined, BASE_INDENT + INDENT_STEP),
    "```",
    "",
    ...renderOpenItems(map.nodes),
  ].join("\n");
}

function renderChildren(nodes: IdeaNode[], parentId: number | undefined, depth: number): string[] {
  return nodes
    .filter((node) => node.parentId === parentId)
    .flatMap((node) => [
      `${indent(depth)}n${node.id}[${label(node)}]`,
      ...renderChildren(nodes, node.id, depth + INDENT_STEP),
    ]);
}

function renderOpenItems(nodes: IdeaNode[]): string[] {
  const open = nodes.filter((node) => !node.resolved);

  if (open.length === 0) return ["## Where we left off", "", "Nothing open. Fresh start."];

  return [
    "## Where we left off",
    ...OPEN_SECTIONS.flatMap(({ kind, title }) => section(title, open, kind)),
  ];
}

function section(title: string, nodes: IdeaNode[], kind: NodeKind): string[] {
  const items = nodes.filter((node) => node.kind === kind);

  if (items.length === 0) return [];

  return ["", `### ${title}`, "", ...items.map((node) => `- #${node.id} ${node.text}`)];
}

function label(node: IdeaNode): string {
  const done = node.resolved ? " ✔" : "";

  return `${ICONS[node.kind]} #${node.id} ${clean(node.text)}${done}`;
}

function clean(text: string): string {
  return text.replace(MERMAID_BREAKING, "");
}

function indent(depth: number): string {
  return " ".repeat(depth);
}
