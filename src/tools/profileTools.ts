import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { CATEGORIES, Labels } from "../i18n";
import { formatProfile, Profile, ProfileEntry } from "../profile/profile";
import { text } from "./text";

export interface ProfileToolOptions {
  profile: Profile;
  labels: Labels;
  limit: number;
}

export function registerProfileTools(server: McpServer, { profile, labels, limit }: ProfileToolOptions): void {
  server.registerTool(
    "remember",
    {
      description: "Save one preference, habit or correction about your human. Tell them in one line.",
      inputSchema: {
        category: z.enum(CATEGORIES),
        fact: z.string().min(1).describe("One short, specific sentence"),
      },
    },
    async ({ category, fact }) => {
      const entry = { topic: labels.categories[category], fact: fact.trim() };

      if (profile.has(entry)) return text(`Already known: ${entry.fact}`);

      if (profile.list().length >= limit) {
        throw new Error(`Profile is full (${limit} facts). Merge similar facts with forget and remember first.`);
      }

      profile.add(entry);

      return text(`Learned: [${entry.topic}] ${entry.fact}`);
    },
  );

  server.registerTool(
    "forget",
    {
      description: "Remove a learned fact. Pass words from it; it must match exactly one fact.",
      inputSchema: { fact: z.string().min(1) },
    },
    async ({ fact }) => {
      const { removed, matches } = profile.forget(fact);

      if (removed) return text(`Forgot: ${removed.fact}`);

      if (matches.length === 0) return text(`Nothing matches "${fact}".`);

      return text(`Several facts match, be more specific:\n${bullets(matches)}`);
    },
  );

  server.registerTool(
    "get_profile",
    { description: "Everything learned about how your human works." },
    async () => text(formatProfile(profile.list())),
  );
}

function bullets(entries: ProfileEntry[]): string {
  return entries.map((entry) => `- ${entry.fact}`).join("\n");
}
