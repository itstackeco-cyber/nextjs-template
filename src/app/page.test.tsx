import { render, screen } from "@testing-library/react";
import Home from "./page";

jest.mock("@/lib/services/blog.service", () => ({
  blogService: {
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => {
    const map = new Map<string, string>([
      ["nav.title", "Blog Manager"],
      ["nav.recentPosts", "Recent Posts"],
      ["nav.emptyState", "No posts yet. Create one above!"],
    ]);
    return map.get(key) ?? key;
  }),
  getLocale: jest.fn().mockResolvedValue("en"),
  getMessages: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/components/templates/HomeTemplate", () => ({
  __esModule: true,
  default: ({
    title,
    listTitle,
    blogList,
  }: {
    title: React.ReactNode;
    listTitle: React.ReactNode;
    blogList: React.ReactNode;
  }) => (
    <div>
      {title}
      {listTitle}
      {blogList}
    </div>
  ),
}));

jest.mock("@/components/organisms/CreateBlogButton/CreateBlogButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/molecules/BlogCard/BlogCard", () => ({
  __esModule: true,
  default: () => null,
}));

describe("Home", () => {
  it("renders heading", async () => {
    const jsx = await Home();
    render(jsx);
    expect(
      screen.getByRole("heading", { name: /Blog Manager/i })
    ).toBeInTheDocument();
  });
});
