import { homedir } from "node:os";
import { join } from "node:path";

import { dataDir, language } from "../src/config";

describe("config", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("uses a visible BecomeHuman folder in the home directory by default", () => {
    delete process.env.BECOME_HUMAN_HOME;

    expect(dataDir()).toBe(join(homedir(), "BecomeHuman"));
  });

  it("uses the folder from BECOME_HUMAN_HOME", () => {
    process.env.BECOME_HUMAN_HOME = "/data/me";

    expect(dataDir()).toBe("/data/me");
  });

  it.each([
    [undefined, "en"],
    ["pt", "pt"],
    ["en", "en"],
    ["klingon", "en"],
  ])("maps BECOME_HUMAN_LANG=%s to %s", (configured, expected) => {
    if (configured === undefined) delete process.env.BECOME_HUMAN_LANG;
    else process.env.BECOME_HUMAN_LANG = configured;

    expect(language()).toBe(expected);
  });
});
