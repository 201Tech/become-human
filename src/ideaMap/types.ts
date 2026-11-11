export const NODE_KINDS = ["idea", "decision", "question", "next"] as const;

export type NodeKind = (typeof NODE_KINDS)[number];

export interface IdeaNode {
  id: number;
  kind: NodeKind;
  text: string;
  parentId?: number;
  resolved: boolean;
  createdAt: string;
}

export interface IdeaMapData {
  project: string;
  updatedAt: string;
  nodes: IdeaNode[];
}

export interface NewIdea {
  kind: NodeKind;
  text: string;
  parentId?: number;
}
