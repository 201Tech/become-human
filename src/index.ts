#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { banner } from "./banner";
import { createServer } from "./server";

// A person typing the command gets a greeting; an agent talks over a pipe.
if (process.stdin.isTTY) {
  process.stderr.write(banner());
  process.exit(0);
}

createServer()
  .connect(new StdioServerTransport())
  .catch((error: unknown) => {
    console.error("BecomeHuman failed to start:", error);
    process.exit(1);
  });
