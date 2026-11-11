import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function tempFolder(): { path: string; remove: () => void } {
  const path = mkdtempSync(join(tmpdir(), "become-human-"));

  return { path, remove: () => rmSync(path, { recursive: true, force: true }) };
}
