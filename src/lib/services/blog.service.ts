import { BaseService } from "./base.service";
import { Blog } from "@/lib/types";
import { BlogSchema } from "@/lib/schemas";
import { API_ROUTES } from "@/lib/constants/routes";

class BlogService extends BaseService<Blog, BlogSchema> {
  constructor() {
    super(API_ROUTES.blogs);
  }
}

export const blogService = new BlogService();
