import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadRules } from "../src/rules";
import { tempFolder } from "./helpers";

describe("loadRules", () => {
  it("loads the bundled rules", () => {
    const rules = loadRules();

    expect(rules.startsWith("# BecomeHuman")).toBe(true);
    expect(rules).toContain("Do the manual work yourself");
  });

  it("trims surrounding whitespace from a custom file", () => {
    const folder = tempFolder();
    const filePath = join(folder.path, "rules.md");
    writeFileSync(filePath, "\n  Be kind.  \n\n");

    expect(loadRules(filePath)).toBe("Be kind.");

    folder.remove();
  });

  it("fails when the file does not exist", () => {
    expect(() => loadRules("/missing/rules.md")).toThrow(/ENOENT/);
  });
});
