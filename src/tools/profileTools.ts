import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { CATEGORIES, formatProfile, Profile } from "../profile/profile";
import { text } from "./text";

export function registerProfileTools(server: McpServer, profile: Profile): void {
  server.registerTool(
    "remember",
    {
      title: "Remember something about the operator",
      description:
        "Save a preference, habit or correction you noticed about how your human works. " +
        "Then tell them in one line what you learned.",
      inputSchema: {
        category: z.enum(CATEGORIES),
        fact: z.string().min(1).describe("One short, specific sentence"),
      },
    },
    async ({ category, fact }) => {
      profile.add({ category, fact });

      return text(`Learned: [${category}] ${fact}`);
    },
  );

  server.registerTool(
    "forget",
    {
      title: "Forget something about the operator",
      description: "Remove a learned fact by its number from get_profile.",
      inputSchema: { number: z.number().int().positive() },
    },
    async ({ number }) => {
      const removed = profile.forget(number);

      return text(removed ? `Forgot: ${removed.fact}` : `There is no fact #${number}.`);
    },
  );

  server.registerTool(
    "get_profile",
    {
      title: "What I know about my operator",
      description: "List everything learned about how your human works, numbered.",
    },
    async () => text(formatProfile(profile.list())),
  );
}
