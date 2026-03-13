import { blogSchema } from "../schemas";

const valid = {
  author: "Alice",
  title: "Hello World",
  content: "Some content here",
};

describe("blogSchema — valid input", () => {
  it("accepts valid data", () => {
    expect(blogSchema.safeParse(valid).success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = blogSchema.safeParse({
      author: "  Alice  ",
      title: "  Hello  ",
      content: "  Some content here  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author).toBe("Alice");
      expect(result.data.title).toBe("Hello");
    }
  });
});

describe("blogSchema — min length", () => {
  it("rejects author shorter than 2 chars", () => {
    expect(blogSchema.safeParse({ ...valid, author: "A" }).success).toBe(false);
  });

  it("rejects title shorter than 2 chars", () => {
    expect(blogSchema.safeParse({ ...valid, title: "X" }).success).toBe(false);
  });

  it("rejects content shorter than 10 chars", () => {
    expect(blogSchema.safeParse({ ...valid, content: "short" }).success).toBe(
      false
    );
  });
});

describe("blogSchema — max length (oversized input / DoS protection)", () => {
  it("rejects author longer than 100 chars", () => {
    expect(
      blogSchema.safeParse({ ...valid, author: "A".repeat(101) }).success
    ).toBe(false);
  });

  it("rejects title longer than 200 chars", () => {
    expect(
      blogSchema.safeParse({ ...valid, title: "T".repeat(201) }).success
    ).toBe(false);
  });

  it("rejects content longer than 10 000 chars", () => {
    expect(
      blogSchema.safeParse({ ...valid, content: "C".repeat(10_001) }).success
    ).toBe(false);
  });
});

describe("blogSchema — missing fields", () => {
  it("rejects missing author", () => {
    const { author: _a, ...rest } = valid;
    expect(blogSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _t, ...rest } = valid;
    expect(blogSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing content", () => {
    const { content: _c, ...rest } = valid;
    expect(blogSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty object", () => {
    expect(blogSchema.safeParse({}).success).toBe(false);
  });
});
