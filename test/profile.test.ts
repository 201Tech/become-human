import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { formatProfile, Profile } from "../src/profile/profile";
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

  const file = () => readFileSync(filePath, "utf8");

  it("is empty when no file exists", () => {
    expect(profile.list()).toEqual([]);
  });

  it("groups facts under one heading per topic", () => {
    profile.add({ topic: "Code", fact: "Uses Jest" });
    profile.add({ topic: "Tone", fact: "Short answers" });
    profile.add({ topic: "Code", fact: "Early returns" });

    expect(file()).toBe(
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

  it("keeps everything the human wrote by hand when adding", () => {
    writeFileSync(filePath, "# Me\n\nA note about me.\n\n## code\n- Uses Jest\n\nloose text\n\n## Pets\n- Two cats\n");

    profile.add({ topic: "Code", fact: "Early returns" });

    expect(file()).toBe(
      "# Me\n\nA note about me.\n\n## code\n- Uses Jest\n\nloose text\n- Early returns\n\n## Pets\n- Two cats\n",
    );
  });

  it("knows a fact it already has, ignoring case", () => {
    profile.add({ topic: "Code", fact: "Uses Jest" });

    expect(profile.has({ topic: "code", fact: "uses jest" })).toBe(true);
    expect(profile.has({ topic: "Code", fact: "Uses Vitest" })).toBe(false);
  });

  it("forgets the single fact that matches the words given", () => {
    profile.add({ topic: "Tone", fact: "Short answers" });
    profile.add({ topic: "Code", fact: "Uses Jest" });

    expect(profile.forget("jest")).toEqual({
      removed: { topic: "Code", fact: "Uses Jest" },
      matches: [{ topic: "Code", fact: "Uses Jest" }],
    });
    expect(profile.list()).toEqual([{ topic: "Tone", fact: "Short answers" }]);
  });

  it("removes nothing when several facts match", () => {
    profile.add({ topic: "Code", fact: "Uses Jest" });
    profile.add({ topic: "Code", fact: "Uses tabs" });

    expect(profile.forget("uses").removed).toBeUndefined();
    expect(profile.forget("uses").matches).toHaveLength(2);
    expect(profile.list()).toHaveLength(2);
  });

  it("removes nothing when no fact matches", () => {
    profile.add({ topic: "Code", fact: "Uses Jest" });

    expect(profile.forget("python")).toEqual({ matches: [] });
  });
});

describe("formatProfile", () => {
  it("writes one compact line per topic", () => {
    const entries = [
      { topic: "Code", fact: "Uses Jest" },
      { topic: "Tone", fact: "Direct" },
      { topic: "Code", fact: "Early returns" },
    ];

    expect(formatProfile(entries)).toBe("Code: Uses Jest; Early returns\nTone: Direct");
  });

  it("invites learning when empty", () => {
    expect(formatProfile([])).toBe("Nothing learned yet. Learn as you go.");
  });
});
