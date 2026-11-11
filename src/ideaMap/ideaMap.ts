import { join } from "node:path";

import { readText, writeText } from "../files";
import { renderMap } from "./render";
import { toSlug } from "./slug";
import { IdeaMapData, IdeaNode, NewIdea } from "./types";

export class IdeaMaps {
  constructor(
    private readonly folder: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  load(project: string): IdeaMapData {
    const content = readText(this.jsonPath(project));

    return content ? (JSON.parse(content) as IdeaMapData) : emptyMap(project);
  }

  add(project: string, idea: NewIdea): IdeaNode {
    const map = this.load(project);

    if (idea.parentId !== undefined) findNode(map, idea.parentId);

    const node: IdeaNode = {
      ...idea,
      id: nextId(map),
      resolved: false,
      createdAt: this.now().toISOString(),
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
    return renderMap(this.load(project));
  }

  private save(map: IdeaMapData): void {
    const updated = { ...map, updatedAt: this.now().toISOString() };

    writeText(this.jsonPath(map.project), JSON.stringify(updated, null, 2));
    writeText(join(this.folder, `${toSlug(map.project)}.md`), renderMap(updated));
  }

  private jsonPath(project: string): string {
    return join(this.folder, `${toSlug(project)}.json`);
  }
}

function emptyMap(project: string): IdeaMapData {
  return { project, updatedAt: "never", nodes: [] };
}

function nextId(map: IdeaMapData): number {
  return Math.max(0, ...map.nodes.map((node) => node.id)) + 1;
}

function findNode(map: IdeaMapData, id: number): IdeaNode {
  const node = map.nodes.find((current) => current.id === id);

  if (!node) throw new Error(`Idea #${id} does not exist in "${map.project}"`);

  return node;
}
