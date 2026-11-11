import { join } from "node:path";

import { readLines, writeLines } from "../lines";
import { insertionLine, LocatedNode, nodeLine, parseNodes, stampMissingIds } from "./markdown";
import { toSlug } from "./slug";
import { summarize } from "./summary";
import { IdeaMapData, IdeaNode, NewIdea } from "./types";

const LINE_BREAKS = /\s*\n\s*/g;
const UNCHECKED = "- [ ]";
const CHECKED = "- [x]";

// Writes touch only the lines that change, so anything the human wrote stays in place.
export class IdeaMaps {
  constructor(private readonly folder: string) {}

  load(project: string): IdeaMapData {
    const nodes = parseNodes(this.read(project)).map(toIdeaNode);

    return { project, nodes };
  }

  add(project: string, idea: NewIdea): IdeaNode {
    const lines = this.read(project);
    const nodes = parseNodes(lines);
    const parent = idea.parentId === undefined ? undefined : findNode(project, nodes, idea.parentId);

    const node: IdeaNode = {
      ...idea,
      id: Math.max(0, ...nodes.map((current) => current.id)) + 1,
      text: idea.text.trim().replace(LINE_BREAKS, " "),
      resolved: idea.kind === "decision",
    };

    stampMissingIds(lines, nodes);

    if (nodes.length === 0) lines.push("");

    const depth = parent ? parent.depth + 1 : 0;

    lines.splice(insertionLine(lines, nodes, parent), 0, nodeLine(node, depth));
    writeLines(this.filePath(project), lines);

    return node;
  }

  resolve(project: string, id: number): IdeaNode {
    const lines = this.read(project);
    const nodes = parseNodes(lines);
    const node = findNode(project, nodes, id);

    stampMissingIds(lines, nodes);
    lines[node.line] = lines[node.line].replace(UNCHECKED, CHECKED);
    writeLines(this.filePath(project), lines);

    return { ...toIdeaNode(node), resolved: true };
  }

  render(project: string): string {
    const lines = this.read(project);

    return `${lines.join("\n")}\n\n${summarize(parseNodes(lines))}`;
  }

  openItems(project: string): string | undefined {
    const nodes = this.load(project).nodes;
    const hasOpen = nodes.some((node) => !node.resolved);

    return hasOpen ? summarize(nodes, `## Where we left off in ${project}`) : undefined;
  }

  filePath(project: string): string {
    return join(this.folder, `${toSlug(project)}.md`);
  }

  private read(project: string): string[] {
    return readLines(this.filePath(project)) ?? [`# ${project}`];
  }
}

function findNode(project: string, nodes: LocatedNode[], id: number): LocatedNode {
  const node = nodes.find((current) => current.id === id);

  if (!node) throw new Error(`Idea #${id} does not exist in "${project}"`);

  return node;
}

function toIdeaNode({ id, kind, text, parentId, resolved }: LocatedNode): IdeaNode {
  return parentId === undefined ? { id, kind, text, resolved } : { id, kind, text, parentId, resolved };
}
