import { join } from "node:path";

import { readText, writeText } from "../files";
import { parseMap, serializeMap } from "./markdown";
import { toSlug } from "./slug";
import { summarize } from "./summary";
import { IdeaMapData, IdeaNode, NewIdea } from "./types";

const LINE_BREAKS = /\s*\n\s*/g;

export class IdeaMaps {
  constructor(private readonly folder: string) {}

  load(project: string): IdeaMapData {
    return parseMap(project, readText(this.filePath(project)) ?? "");
  }

  add(project: string, idea: NewIdea): IdeaNode {
    const map = this.load(project);

    if (idea.parentId !== undefined) findNode(map, idea.parentId);

    const node: IdeaNode = {
      ...idea,
      id: Math.max(0, ...map.nodes.map((current) => current.id)) + 1,
      text: idea.text.trim().replace(LINE_BREAKS, " "),
      resolved: idea.kind === "decision",
    };

    this.save({ ...map, nodes: [...map.nodes, node] });

    return node;
  }

  resolve(project: string, id: number): IdeaNode {
    const map = this.load(project);
    const node = { ...findNode(map, id), resolved: true };

    this.save({ ...map, nodes: map.nodes.map((current) => (current.id === id ? node : current)) });

    return node;
  }

  render(project: string): string {
    const map = this.load(project);

    return `${serializeMap(map)}\n${summarize(map.nodes)}`;
  }

  filePath(project: string): string {
    return join(this.folder, `${toSlug(project)}.md`);
  }

  private save(map: IdeaMapData): void {
    writeText(this.filePath(map.project), serializeMap(map));
  }
}

function findNode(map: IdeaMapData, id: number): IdeaNode {
  const node = map.nodes.find((current) => current.id === id);

  if (!node) throw new Error(`Idea #${id} does not exist in "${map.project}"`);

  return node;
}
