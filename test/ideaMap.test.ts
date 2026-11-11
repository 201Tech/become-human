import { readFileSync, writeFileSync } from "node:fs";

import { IdeaMaps } from "../src/ideaMap/ideaMap";
import { parseNodes } from "../src/ideaMap/markdown";
import { toSlug } from "../src/ideaMap/slug";
import { tempFolder } from "./helpers";

describe("toSlug", () => {
  it.each([
    ["BecomeHuman", "becomehuman"],
    ["my app (v2)", "my-app-v2"],
    ["../../etc/passwd", "etc-passwd"],
    ["snake_case-name", "snake_case-name"],
  ])("turns %s into %s", (project, slug) => {
    expect(toSlug(project)).toBe(slug);
  });

  it("rejects names with no safe characters", () => {
    expect(() => toSlug("../..")).toThrow('Invalid project name: "../.."');
  });
});

describe("parseNodes", () => {
  it("reads lines written by hand, with or without icon and id", () => {
    const lines = ["# demo", "", "- [ ] ❓ #3 Sync later?", "  - [x] plain child", "a note", "- [ ] ➡️ Ship"];

    expect(parseNodes(lines).map(({ id, kind, text, parentId, resolved }) => ({ id, kind, text, parentId, resolved }))).toEqual([
      { id: 3, kind: "question", text: "Sync later?", parentId: undefined, resolved: false },
      { id: 4, kind: "idea", text: "plain child", parentId: 3, resolved: true },
      { id: 5, kind: "next", text: "Ship", parentId: undefined, resolved: false },
    ]);
  });

  it("attaches over-indented lines to the deepest valid parent", () => {
    const lines = ["- [ ] 💡 #1 Root", "      - [ ] 💡 #2 Deep"];

    expect(parseNodes(lines)[1].parentId).toBe(1);
  });
});

describe("IdeaMaps", () => {
  let folder: ReturnType<typeof tempFolder>;
  let maps: IdeaMaps;

  beforeEach(() => {
    folder = tempFolder();
    maps = new IdeaMaps(folder.path);
  });

  afterEach(() => folder.remove());

  const file = (project: string) => readFileSync(maps.filePath(project), "utf8");

  it("starts empty for a new project", () => {
    expect(maps.load("demo")).toEqual({ project: "demo", nodes: [] });
  });

  it("adds nodes with increasing ids", () => {
    expect(maps.add("demo", { kind: "idea", text: "Profiles" })).toEqual({
      id: 1,
      kind: "idea",
      text: "Profiles",
      resolved: false,
    });
    expect(maps.add("demo", { kind: "question", text: "Where?", parentId: 1 })).toEqual({
      id: 2,
      kind: "question",
      text: "Where?",
      parentId: 1,
      resolved: false,
    });
  });

  it("records decisions as already made", () => {
    expect(maps.add("demo", { kind: "decision", text: "Use Markdown" }).resolved).toBe(true);
  });

  it("keeps each node on a single line", () => {
    expect(maps.add("demo", { kind: "idea", text: "  two\n  lines " }).text).toBe("two lines");
  });

  it("rejects a parent that does not exist", () => {
    expect(() => maps.add("demo", { kind: "idea", text: "X", parentId: 9 })).toThrow(
      'Idea #9 does not exist in "demo"',
    );
  });

  it("writes a checklist tree, placing children under their parent", () => {
    maps.add("My App", { kind: "idea", text: "Profiles" });
    maps.add("My App", { kind: "next", text: "Ship" });
    maps.add("My App", { kind: "decision", text: "Markdown file", parentId: 1 });
    maps.add("My App", { kind: "question", text: "Sync later?", parentId: 3 });

    expect(file("My App")).toBe(
      [
        "# My App",
        "",
        "- [ ] 💡 #1 Profiles",
        "  - [x] ✅ #3 Markdown file",
        "    - [ ] ❓ #4 Sync later?",
        "- [ ] ➡️ #2 Ship",
        "",
      ].join("\n"),
    );
  });

  it("resolves a node by ticking only its box", () => {
    maps.add("demo", { kind: "next", text: "Write tests" });

    expect(maps.resolve("demo", 1).resolved).toBe(true);
    expect(file("demo")).toBe("# demo\n\n- [x] ➡️ #1 Write tests\n");
  });

  it("fails to resolve a node that does not exist", () => {
    expect(() => maps.resolve("demo", 1)).toThrow('Idea #1 does not exist in "demo"');
  });

  it("keeps notes the human wrote and gives ids to their new lines", () => {
    maps.add("demo", { kind: "next", text: "Ship" });
    writeFileSync(
      maps.filePath("demo"),
      "# demo\n\nNotes from the meeting.\n\n- [x] ➡️ #1 Ship\n- [ ] ❓ Who reviews?\n\nEnd notes.\n",
    );

    maps.add("demo", { kind: "idea", text: "Banner" });

    expect(file("demo")).toBe(
      "# demo\n\nNotes from the meeting.\n\n- [x] ➡️ #1 Ship\n- [ ] ❓ #2 Who reviews?\n- [ ] 💡 #3 Banner\n\nEnd notes.\n",
    );
  });

  it("renders the file followed by what is still open", () => {
    maps.add("demo", { kind: "question", text: "Sync later?" });
    maps.add("demo", { kind: "next", text: "Ship" });
    maps.add("demo", { kind: "next", text: "README" });
    maps.resolve("demo", 3);

    expect(maps.render("demo")).toBe(
      [
        "# demo",
        "",
        "- [ ] ❓ #1 Sync later?",
        "- [ ] ➡️ #2 Ship",
        "- [x] ➡️ #3 README",
        "",
        "## Where we left off",
        "",
        "### Next steps",
        "",
        "- #2 Ship",
        "",
        "### Open questions",
        "",
        "- #1 Sync later?",
      ].join("\n"),
    );
  });

  it("lists only open items for the start of a session", () => {
    maps.add("demo", { kind: "idea", text: "Profiles" });
    maps.add("demo", { kind: "next", text: "Ship" });

    expect(maps.openItems("demo")).toBe("## Where we left off in demo\n\n### Next steps\n\n- #2 Ship");
  });

  it("has no open items when everything is resolved", () => {
    maps.add("demo", { kind: "decision", text: "Markdown" });

    expect(maps.openItems("demo")).toBeUndefined();
    expect(maps.openItems("empty")).toBeUndefined();
  });
});
