import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { labels } from "../src/i18n";
import { loadPersonalRules, loadRules } from "../src/rules";
import { tempFolder } from "./helpers";

describe("loadRules", () => {
  it("loads the bundled rules", () => {
    const rules = loadRules();

    expect(rules.startsWith("# BecomeHuman")).toBe(true);
    expect(rules).toContain("Do the manual work yourself");
  });

  it("fails when the file does not exist", () => {
    expect(() => loadRules("/missing/rules.md")).toThrow(/ENOENT/);
  });
});

describe("loadPersonalRules", () => {
  let folder: ReturnType<typeof tempFolder>;
  let filePath: string;

  beforeEach(() => {
    folder = tempFolder();
    filePath = join(folder.path, "my-rules.md");
  });

  afterEach(() => folder.remove());

  it("returns nothing when the file does not exist", () => {
    expect(loadPersonalRules(filePath)).toBeUndefined();
  });

  it.each(["en", "pt"] as const)("ignores the untouched %s template", (language) => {
    writeFileSync(filePath, labels(language).myRulesTemplate);

    expect(loadPersonalRules(filePath)).toBeUndefined();
  });

  it("returns the rules the human wrote, without comments", () => {
    writeFileSync(filePath, "# My rules\n\n<!-- hint -->\n- Answer in Portuguese.\n");

    expect(loadPersonalRules(filePath)).toBe("# My rules\n\n\n- Answer in Portuguese.");
  });
});
