import { ICONS, IdeaMapData, IdeaNode, NodeKind } from "./types";

const INDENT = "  ";
const NODE_LINE = /^(\s*)- \[([ xX])\] (.+)$/;
const ID_PREFIX = /^#(\d+)\s+(.+)$/;
const KIND_BY_ICON = new Map(Object.entries(ICONS).map(([kind, icon]) => [icon, kind as NodeKind]));

interface ParsedLine {
  depth: number;
  resolved: boolean;
  kind: NodeKind;
  id?: number;
  text: string;
}

export function serializeMap(map: IdeaMapData): string {
  return [`# ${map.project}`, "", ...serializeChildren(map.nodes, undefined, 0), ""].join("\n");
}

function serializeChildren(nodes: IdeaNode[], parentId: number | undefined, depth: number): string[] {
  return nodes
    .filter((node) => node.parentId === parentId)
    .flatMap((node) => [nodeLine(node, depth), ...serializeChildren(nodes, node.id, depth + 1)]);
}

function nodeLine(node: IdeaNode, depth: number): string {
  const box = node.resolved ? "x" : " ";

  return `${INDENT.repeat(depth)}- [${box}] ${ICONS[node.kind]} #${node.id} ${node.text}`;
}

// Lines the human adds by hand may skip the icon or the id: they become ideas with new ids.
export function parseMap(project: string, content: string): IdeaMapData {
  const parsed = content.split("\n").flatMap(parseLine);
  let nextId = Math.max(0, ...parsed.map((line) => line.id ?? 0)) + 1;
  const parentAtDepth: number[] = [];

  const nodes = parsed.map((line): IdeaNode => {
    const id = line.id ?? nextId++;
    const depth = Math.min(line.depth, parentAtDepth.length);
    const parentId = depth > 0 ? parentAtDepth[depth - 1] : undefined;

    parentAtDepth.length = depth;
    parentAtDepth.push(id);

    return { id, kind: line.kind, text: line.text, parentId, resolved: line.resolved };
  });

  return { project, nodes };
}

function parseLine(line: string): ParsedLine[] {
  const match = NODE_LINE.exec(line);

  if (!match) return [];

  const [, indent, box, rest] = match;
  const [firstWord, ...words] = rest.split(" ");
  const iconKind = KIND_BY_ICON.get(firstWord);
  const afterIcon = iconKind ? words.join(" ") : rest;
  const idMatch = ID_PREFIX.exec(afterIcon);

  return [
    {
      depth: Math.floor(indent.length / INDENT.length),
      resolved: box !== " ",
      kind: iconKind ?? "idea",
      id: idMatch ? Number(idMatch[1]) : undefined,
      text: idMatch ? idMatch[2] : afterIcon,
    },
  ];
}
