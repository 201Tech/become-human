import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { DataPaths } from "../paths";
import { text } from "./text";

export function registerDataTools(server: McpServer, paths: DataPaths): void {
  server.registerTool(
    "where_is_my_data",
    { description: "Where the human's BecomeHuman files are and what each holds." },
    async () =>
      text(
        [
          `Folder: ${paths.folder}`,
          `- ${paths.profile}: what the agent learned about the operator, editable by hand`,
          `- ${paths.myRules}: the operator's own rules, added to every session`,
          `- ${paths.maps}: one idea map per project, a Markdown checklist editable by hand`,
        ].join("\n"),
      ),
  );
}
