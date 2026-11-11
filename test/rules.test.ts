import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadRules } from "../src/rules";

describe("loadRules", () => {
  it("loads the bundled rules", () => {
    const rules = loadRules();

    expect(rules.startsWith("# BecomeHuman")).toBe(true);
    expect(rules).toContain("Do the manual work yourself");
  });

  it("trims surrounding whitespace from a custom file", () => {
    const folder = mkdtempSync(join(tmpdir(), "become-human-"));
    const filePath = join(folder, "rules.md");
    writeFileSync(filePath, "\n  Be kind.  \n\n");

    expect(loadRules(filePath)).toBe("Be kind.");

    rmSync(folder, { recursive: true });
  });

  it("fails when the file does not exist", () => {
    expect(() => loadRules("/missing/rules.md")).toThrow(/ENOENT/);
  });
});
