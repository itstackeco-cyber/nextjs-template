import { rateLimit, getClientIp } from "../rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const result = rateLimit("test-key-1", 5, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", () => {
    const key = "test-key-block";
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000);
    const result = rateLimit(key, 3, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    const key = "test-key-reset";
    // Fill up
    for (let i = 0; i < 2; i++) rateLimit(key, 2, 1);
    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = rateLimit(key, 2, 1);
        expect(result.success).toBe(true);
        resolve();
      }, 10);
    });
  });

  it("tracks different keys independently", () => {
    const r1 = rateLimit("key-a", 2, 60_000);
    const r2 = rateLimit("key-b", 2, 60_000);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
});

describe("getClientIp", () => {
  it("returns the first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("returns 'unknown' when header is missing", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});
