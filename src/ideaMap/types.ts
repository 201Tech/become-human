export const NODE_KINDS = ["idea", "decision", "question", "next"] as const;

export type NodeKind = (typeof NODE_KINDS)[number];

export const ICONS: Record<NodeKind, string> = {
  idea: "💡",
  decision: "✅",
  question: "❓",
  next: "➡️",
};

export interface IdeaNode {
  id: number;
  kind: NodeKind;
  text: string;
  parentId?: number;
  resolved: boolean;
}

export interface IdeaMapData {
  project: string;
  nodes: IdeaNode[];
}

export interface NewIdea {
  kind: NodeKind;
  text: string;
  parentId?: number;
}
