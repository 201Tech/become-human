import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { IdeaMaps } from "../src/ideaMap/ideaMap";
import { toSlug } from "../src/ideaMap/slug";
import { tempFolder } from "./helpers";

const NOW = new Date("2026-11-11T10:00:00.000Z");

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

describe("IdeaMaps", () => {
  let folder: ReturnType<typeof tempFolder>;
  let maps: IdeaMaps;

  beforeEach(() => {
    folder = tempFolder();
    maps = new IdeaMaps(folder.path, () => NOW);
  });

  afterEach(() => folder.remove());

  it("starts empty for a new project", () => {
    expect(maps.load("demo")).toEqual({ project: "demo", updatedAt: "never", nodes: [] });
  });

  it("adds nodes with increasing ids", () => {
    const first = maps.add("demo", { kind: "idea", text: "Profiles" });
    const second = maps.add("demo", { kind: "question", text: "Where to store?", parentId: 1 });

    expect(first).toEqual({
      id: 1,
      kind: "idea",
      text: "Profiles",
      resolved: false,
      createdAt: NOW.toISOString(),
    });
    expect(second.id).toBe(2);
    expect(second.parentId).toBe(1);
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

  it("writes JSON and a readable Markdown map side by side", () => {
    maps.add("My App", { kind: "idea", text: "Login" });

    expect(existsSync(join(folder.path, "my-app.json"))).toBe(true);
    expect(readFileSync(join(folder.path, "my-app.md"), "utf8")).toBe(maps.render("My App"));
  });

  it("renders a mindmap tree and what is still open", () => {
    maps.add("demo", { kind: "idea", text: "Profiles (local)" });
    maps.add("demo", { kind: "decision", text: "Markdown file", parentId: 1 });
    maps.add("demo", { kind: "question", text: "Sync later?", parentId: 1 });
    maps.add("demo", { kind: "next", text: "Ship v0.2" });
    maps.add("demo", { kind: "next", text: "Write README" });
    maps.resolve("demo", 5);

    expect(maps.render("demo")).toBe(
      [
        "# Idea map: demo",
        "",
        `Updated ${NOW.toISOString()}`,
        "",
        "```mermaid",
        "mindmap",
        "  root((demo))",
        "    n1[💡 #1 Profiles local]",
        "      n2[✅ #2 Markdown file]",
        "      n3[❓ #3 Sync later?]",
        "    n4[➡️ #4 Ship v0.2]",
        "    n5[➡️ #5 Write README ✔]",
        "```",
        "",
        "## Where we left off",
        "",
        "### Next steps",
        "",
        "- #4 Ship v0.2",
        "",
        "### Open questions",
        "",
        "- #3 Sync later?",
      ].join("\n"),
    );
  });

  it("says when nothing is open", () => {
    expect(maps.render("demo")).toContain("Nothing open. Fresh start.");
  });
});
