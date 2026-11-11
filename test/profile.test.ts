import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { formatProfile, Profile } from "../src/profile/profile";
import { tempFolder } from "./helpers";

describe("Profile", () => {
  let folder: ReturnType<typeof tempFolder>;
  let filePath: string;
  let profile: Profile;

  beforeEach(() => {
    folder = tempFolder();
    filePath = join(folder.path, "profile.md");
    profile = new Profile(filePath);
  });

  afterEach(() => folder.remove());

  it("is empty when no file exists", () => {
    expect(profile.list()).toEqual([]);
  });

  it("saves facts as readable Markdown", () => {
    profile.add({ category: "code", fact: "Prefers early returns" });

    expect(readFileSync(filePath, "utf8")).toBe(
      "# What I learned about my operator\n\n- **code:** Prefers early returns\n",
    );
  });

  it("keeps facts in the order they were learned", () => {
    profile.add({ category: "tone", fact: "Likes short answers" });
    profile.add({ category: "code", fact: "Uses Jest" });

    expect(profile.list()).toEqual([
      { category: "tone", fact: "Likes short answers" },
      { category: "code", fact: "Uses Jest" },
    ]);
  });

  it("reads facts the human wrote by hand and ignores other lines", () => {
    writeFileSync(filePath, "# Notes\n\nfree text\n- **workflow:** Squash merges\n");

    expect(profile.list()).toEqual([{ category: "workflow", fact: "Squash merges" }]);
  });

  it("forgets a fact by its number", () => {
    profile.add({ category: "tone", fact: "A" });
    profile.add({ category: "tone", fact: "B" });

    expect(profile.forget(1)).toEqual({ category: "tone", fact: "A" });
    expect(profile.list()).toEqual([{ category: "tone", fact: "B" }]);
  });

  it("returns nothing when forgetting a number that does not exist", () => {
    profile.add({ category: "tone", fact: "A" });

    expect(profile.forget(5)).toBeUndefined();
    expect(profile.list()).toHaveLength(1);
  });
});

describe("formatProfile", () => {
  it("numbers each fact with its category", () => {
    const entries = [
      { category: "code", fact: "Uses Jest" },
      { category: "tone", fact: "Direct" },
    ];

    expect(formatProfile(entries)).toBe("1. [code] Uses Jest\n2. [tone] Direct");
  });

  it("invites learning when empty", () => {
    expect(formatProfile([])).toBe("Nothing learned yet. Learn as you go.");
  });
});
