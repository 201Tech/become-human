import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { IdeaMaps } from "../ideaMap/ideaMap";
import { NODE_KINDS } from "../ideaMap/types";
import { text } from "./text";

const project = z.string().min(1).describe("Repository folder name");

export function registerMapTools(server: McpServer, maps: IdeaMaps): void {
  server.registerTool(
    "get_map",
    {
      description: "Full idea map of a project, plus what is still open.",
      inputSchema: { project },
    },
    async (input) => text(maps.render(input.project)),
  );

  server.registerTool(
    "map_add",
    {
      description: "Record an idea, decision, question or next step. parentId links it to a node.",
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
      description: "Mark a question answered or a next step done.",
      inputSchema: { project, id: z.number().int().positive() },
    },
    async (input) => {
      const node = maps.resolve(input.project, input.id);

      return text(`Resolved #${node.id}: ${node.text}`);
    },
  );
}
