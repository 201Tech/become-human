import { banner } from "../src/banner";

describe("banner", () => {
  it("shows the two hands, how to install and where the files are", () => {
    const text = banner("/home/me/BecomeHuman");

    expect(text).toContain("]=[]=[]=[]=[]=[>   *   <__________(");
    expect(text).toContain("claude mcp add become-human");
    expect(text).toContain("Your files:   /home/me/BecomeHuman");
  });
});
