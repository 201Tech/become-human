import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { IdeaMaps } from "../src/ideaMap/ideaMap";
import { parseMap } from "../src/ideaMap/markdown";
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

describe("parseMap", () => {
  it("reads lines the human wrote by hand, with or without icon and id", () => {
    const content = [
      "# demo",
      "",
      "- [ ] ❓ #3 Sync later?",
      "  - [x] plain child",
      "some note that is not a node",
      "- [ ] ➡️ Ship",
    ].join("\n");

    expect(parseMap("demo", content).nodes).toEqual([
      { id: 3, kind: "question", text: "Sync later?", parentId: undefined, resolved: false },
      { id: 4, kind: "idea", text: "plain child", parentId: 3, resolved: true },
      { id: 5, kind: "next", text: "Ship", parentId: undefined, resolved: false },
    ]);
  });

  it("attaches over-indented lines to the deepest valid parent", () => {
    const content = "- [ ] 💡 #1 Root\n      - [ ] 💡 #2 Deep";

    expect(parseMap("demo", content).nodes[1].parentId).toBe(1);
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

  it("starts empty for a new project", () => {
    expect(maps.load("demo")).toEqual({ project: "demo", nodes: [] });
  });

  it("adds nodes with increasing ids", () => {
    const first = maps.add("demo", { kind: "idea", text: "Profiles" });
    const second = maps.add("demo", { kind: "question", text: "Where to store?", parentId: 1 });

    expect(first).toEqual({ id: 1, kind: "idea", text: "Profiles", resolved: false });
    expect(second).toEqual({
      id: 2,
      kind: "question",
      text: "Where to store?",
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

  it("resolves a node", () => {
    maps.add("demo", { kind: "next", text: "Write tests" });

    expect(maps.resolve("demo", 1).resolved).toBe(true);
    expect(maps.load("demo").nodes[0].resolved).toBe(true);
  });

  it("fails to resolve a node that does not exist", () => {
    expect(() => maps.resolve("demo", 1)).toThrow('Idea #1 does not exist in "demo"');
  });

  it("writes a single Markdown checklist tree", () => {
    maps.add("My App", { kind: "idea", text: "Profiles" });
    maps.add("My App", { kind: "decision", text: "Markdown file", parentId: 1 });
    maps.add("My App", { kind: "question", text: "Sync later?", parentId: 1 });
    maps.add("My App", { kind: "next", text: "Ship" });

    expect(readFileSync(join(folder.path, "my-app.md"), "utf8")).toBe(
      [
        "# My App",
        "",
        "- [ ] 💡 #1 Profiles",
        "  - [x] ✅ #2 Markdown file",
        "  - [ ] ❓ #3 Sync later?",
        "- [ ] ➡️ #4 Ship",
        "",
      ].join("\n"),
    );
  });

  it("keeps what the human edited by hand", () => {
    maps.add("demo", { kind: "next", text: "Ship" });
    writeFileSync(maps.filePath("demo"), "# demo\n\n- [x] ➡️ #1 Ship\n- [ ] ❓ Who reviews?\n");

    maps.add("demo", { kind: "idea", text: "Banner" });

    expect(maps.load("demo").nodes.map((node) => [node.id, node.text, node.resolved])).toEqual([
      [1, "Ship", true],
      [2, "Who reviews?", false],
      [3, "Banner", false],
    ]);
  });

  it("renders the map followed by what is still open", () => {
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

  it("says when nothing is open", () => {
    expect(maps.render("demo")).toContain("## Where we left off\n\nNothing open.");
  });
});
