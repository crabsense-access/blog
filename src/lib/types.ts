export type PostStatus = "draft" | "published";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pill_color: string | null;
  image_url: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  pill_color: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  public_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_featured_expert: boolean;
  featured_position: number | null;
  linkedin_url: string | null;
  role: "admin" | "editor";
  created_at: string;
}

export interface PostFaq {
  question: string;
  answer: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  quick_answer: string | null;
  content: string;
  cover_image_url: string | null;
  status: PostStatus;
  category_id: string | null;
  author_id: string | null;
  published_at: string | null;
  is_featured: boolean;
  is_popular: boolean;
  featured_in_slider: boolean;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  faqs: PostFaq[];
  created_at: string;
  updated_at: string;
}

export interface PostWithRelations extends Post {
  category: Category | null;
  subcategories: Subcategory[];
  author: Pick<
    Profile,
    "id" | "full_name" | "email" | "public_title" | "avatar_url" | "linkedin_url"
  > | null;
}

export interface HomeBanner {
  id: true;
  title: string;
  image_url: string | null;
  link_url: string | null;
  updated_at: string;
}

export interface CategoryBlock {
  position: 1 | 2 | 3;
  category_id: string | null;
  updated_at: string;
}

export interface CategoryBlockWithCategory extends CategoryBlock {
  category: Category | null;
}

export interface Client {
  id: string;
  name: string;
  logo_url: string;
  row_number: 1 | 2 | 3;
  sort_order: number;
  created_at: string;
}

export interface SiteSettings {
  id: true;
  category_page_initial_items: number;
  updated_at: string;
}
