import { ICONS, IdeaNode, NodeKind } from "./types";

export const INDENT = "  ";

const NODE_LINE = /^(\s*)- \[([ xX])\] (.+)$/;
const ID_PREFIX = /^#(\d+)\s+(.+)$/;
const KIND_BY_ICON = new Map(Object.entries(ICONS).map(([kind, icon]) => [icon, kind as NodeKind]));

export interface LocatedNode extends IdeaNode {
  line: number;
  depth: number;
  hasId: boolean;
}

interface ParsedLine {
  line: number;
  depth: number;
  resolved: boolean;
  kind: NodeKind;
  icon?: string;
  id?: number;
  text: string;
}

export function nodeLine(node: IdeaNode, depth: number): string {
  const box = node.resolved ? "x" : " ";

  return `${INDENT.repeat(depth)}- [${box}] ${ICONS[node.kind]} #${node.id} ${node.text}`;
}

// Lines the human adds by hand may skip the icon or the id: they become ideas with new ids.
export function parseNodes(lines: string[]): LocatedNode[] {
  const parsed = lines.flatMap(parseLine);
  let nextId = Math.max(0, ...parsed.map((line) => line.id ?? 0)) + 1;
  const parentAtDepth: number[] = [];

  return parsed.map((line): LocatedNode => {
    const id = line.id ?? nextId++;
    const depth = Math.min(line.depth, parentAtDepth.length);
    const parentId = depth > 0 ? parentAtDepth[depth - 1] : undefined;

    parentAtDepth.length = depth;
    parentAtDepth.push(id);

    return {
      id,
      kind: line.kind,
      text: line.text,
      parentId,
      resolved: line.resolved,
      line: line.line,
      depth,
      hasId: line.id !== undefined,
    };
  });
}

function parseLine(raw: string, line: number): ParsedLine[] {
  const match = NODE_LINE.exec(raw);

  if (!match) return [];

  const [, indent, box, rest] = match;
  const [firstWord, ...words] = rest.split(" ");
  const iconKind = KIND_BY_ICON.get(firstWord);
  const afterIcon = iconKind ? words.join(" ") : rest;
  const idMatch = ID_PREFIX.exec(afterIcon);

  return [
    {
      line,
      depth: Math.floor(indent.length / INDENT.length),
      resolved: box !== " ",
      kind: iconKind ?? "idea",
      id: idMatch ? Number(idMatch[1]) : undefined,
      text: idMatch ? idMatch[2] : afterIcon,
    },
  ];
}

export function stampMissingIds(lines: string[], nodes: LocatedNode[]): void {
  nodes
    .filter((node) => !node.hasId)
    .forEach((node) => (lines[node.line] = nodeLine(node, node.depth)));
}

export function insertionLine(lines: string[], nodes: LocatedNode[], parent?: LocatedNode): number {
  if (!parent) return nodes.length > 0 ? nodes[nodes.length - 1].line + 1 : lines.length;

  const after = nodes.slice(nodes.indexOf(parent) + 1);
  const firstOutside = after.findIndex((node) => node.depth <= parent.depth);
  const subtree = firstOutside === -1 ? after : after.slice(0, firstOutside);

  return (subtree.length > 0 ? subtree[subtree.length - 1].line : parent.line) + 1;
}
