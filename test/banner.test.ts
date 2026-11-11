import { banner } from "../src/banner";

describe("banner", () => {
  it("shows the two hands and how to install", () => {
    const text = banner();

    expect(text).toContain("<(__________");
    expect(text).toContain("machine");
    expect(text).toContain("claude mcp add become-human");
  });
});
