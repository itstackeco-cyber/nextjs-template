import { isSafeUrl, safeUrl } from "../url";

describe("isSafeUrl", () => {
  it("accepts https URLs", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
  });

  it("accepts http URLs", () => {
    expect(isSafeUrl("http://example.com")).toBe(true);
  });

  it("rejects javascript: protocol", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: protocol", () => {
    expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("rejects vbscript: protocol", () => {
    expect(isSafeUrl("vbscript:msgbox(1)")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isSafeUrl("")).toBe(false);
  });

  it("rejects non-URL strings", () => {
    expect(isSafeUrl("not a url")).toBe(false);
  });
});

describe("safeUrl", () => {
  it("returns the URL when safe", () => {
    expect(safeUrl("https://example.com")).toBe("https://example.com");
  });

  it("returns # for unsafe URL", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("#");
  });

  it("returns custom fallback for unsafe URL", () => {
    expect(safeUrl("javascript:alert(1)", "/")).toBe("/");
  });
});
