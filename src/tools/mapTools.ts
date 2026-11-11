import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { IdeaMaps } from "../ideaMap/ideaMap";
import { NODE_KINDS } from "../ideaMap/types";
import { text } from "./text";

const project = z.string().min(1).describe("Project name, usually the repository folder name");

export function registerMapTools(server: McpServer, maps: IdeaMaps): void {
  server.registerTool(
    "get_map",
    {
      title: "Project idea map",
      description:
        "Read the idea map of a project: ideas, decisions, open questions and next steps. " +
        "Call it at the start of every session to pick up where you left off.",
      inputSchema: { project },
    },
    async (input) => text(maps.render(input.project)),
  );

  server.registerTool(
    "map_add",
    {
      title: "Add to the idea map",
      description:
        "Record an idea, decision, open question or next step as the conversation evolves. " +
        "Use parentId to connect it to a related node.",
      inputSchema: {
        project,
        kind: z.enum(NODE_KINDS),
        text: z.string().min(1),
        parentId: z.number().int().positive().optional(),
      },
    },
    async ({ project: name, ...idea }) => {
      const node = maps.add(name, idea);

      return text(`Added #${node.id} (${node.kind}): ${node.text}`);
    },
  );

  server.registerTool(
    "map_resolve",
    {
      title: "Resolve an idea map item",
      description: "Mark a question as answered or a next step as done.",
      inputSchema: { project, id: z.number().int().positive() },
    },
    async (input) => {
      const node = maps.resolve(input.project, input.id);

      return text(`Resolved #${node.id}: ${node.text}`);
    },
  );
}
