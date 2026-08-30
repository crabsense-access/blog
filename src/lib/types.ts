export type PostStatus = "draft" | "published";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: "admin" | "editor";
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: PostStatus;
  category_id: string | null;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithRelations extends Post {
  category: Category | null;
  tags: Tag[];
}
