import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { formatProfile, parseProfile, Profile } from "../src/profile/profile";
import { tempFolder } from "./helpers";

const TITLE = "What I learned about you";

describe("Profile", () => {
  let folder: ReturnType<typeof tempFolder>;
  let filePath: string;
  let profile: Profile;

  beforeEach(() => {
    folder = tempFolder();
    filePath = join(folder.path, "profile.md");
    profile = new Profile(filePath, TITLE);
  });

  afterEach(() => folder.remove());

  it("is empty when no file exists", () => {
    expect(profile.list()).toEqual([]);
  });

  it("groups facts under one heading per topic", () => {
    profile.add({ topic: "Code", fact: "Uses Jest" });
    profile.add({ topic: "Tone", fact: "Short answers" });
    profile.add({ topic: "Code", fact: "Early returns" });

    expect(readFileSync(filePath, "utf8")).toBe(
      [
        "# What I learned about you",
        "",
        "## Code",
        "- Uses Jest",
        "- Early returns",
        "",
        "## Tone",
        "- Short answers",
        "",
      ].join("\n"),
    );
  });

  it("numbers facts in the order they appear in the file", () => {
    profile.add({ topic: "Code", fact: "A" });
    profile.add({ topic: "Tone", fact: "B" });
    profile.add({ topic: "Code", fact: "C" });

    expect(profile.list().map((entry) => entry.fact)).toEqual(["A", "C", "B"]);
  });

  it("keeps topics the human created by hand", () => {
    writeFileSync(filePath, "# Me\n\n## Personal\n- Has two cats\n");
    profile.add({ topic: "Code", fact: "Uses Jest" });

    expect(profile.list()).toEqual([
      { topic: "Personal", fact: "Has two cats" },
      { topic: "Code", fact: "Uses Jest" },
    ]);
  });

  it("forgets a fact by its number", () => {
    profile.add({ topic: "Tone", fact: "A" });
    profile.add({ topic: "Tone", fact: "B" });

    expect(profile.forget(1)).toEqual({ topic: "Tone", fact: "A" });
    expect(profile.list()).toEqual([{ topic: "Tone", fact: "B" }]);
  });

  it("returns nothing when forgetting a number that does not exist", () => {
    profile.add({ topic: "Tone", fact: "A" });

    expect(profile.forget(5)).toBeUndefined();
    expect(profile.list()).toHaveLength(1);
  });
});

describe("parseProfile", () => {
  it("accepts * bullets and ignores text outside topics", () => {
    const content = "# Title\n\nintro text\n- loose bullet\n\n## Code\n* Uses Jest\nnote\n";

    expect(parseProfile(content)).toEqual([{ topic: "Code", fact: "Uses Jest" }]);
  });
});

describe("formatProfile", () => {
  it("numbers each fact with its topic", () => {
    const entries = [
      { topic: "Code", fact: "Uses Jest" },
      { topic: "Tone", fact: "Direct" },
    ];

    expect(formatProfile(entries)).toBe("1. [Code] Uses Jest\n2. [Tone] Direct");
  });

  it("invites learning when empty", () => {
    expect(formatProfile([])).toBe("Nothing learned yet. Learn as you go.");
  });
});
