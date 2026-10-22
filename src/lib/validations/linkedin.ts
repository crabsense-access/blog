import { z } from "zod";

const slideItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const slideBarSchema = z.object({
  label: z.string(),
  value: z.coerce.number().min(0).max(100),
  display: z.string(),
});

export const linkedInSlideSchema = z.object({
  kind: z.enum(["cover", "stat", "list", "text", "compare", "cta"]),
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  body: z.string().default(""),
  value: z.string().default(""),
  items: z.array(slideItemSchema).default([]),
  bars: z.array(slideBarSchema).default([]),
  left_label: z.string().default(""),
  left_body: z.string().default(""),
  right_label: z.string().default(""),
  right_body: z.string().default(""),
  list_style: z.enum(["roman", "check", "cross"]).default("roman"),
  source: z.string().default(""),
  button: z.string().default(""),
  figure: z.enum(["none", "pedestal", "estatua", "coliseo", "catapulta"]).default("none"),
});

const optionalUuid = z
  .string()
  .uuid()
  .or(z.literal(""))
  .transform((v) => (v === "" ? null : v));

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : null));

export const linkedInPostFormSchema = z.object({
  type: z.enum([
    "article",
    "product_update",
    "stat",
    "success_case",
    "before_after",
    "opinion",
    "checklist",
  ]),
  title: z.string().trim().min(1, "Poné un título interno para identificar el post."),
  format: z.enum(["carousel", "image_carousel", "image", "text"]),
  source_post_id: optionalUuid,
  source_case_id: optionalUuid,
  source_url: optionalText,
  platform: optionalText,
  source_notes: optionalText,
  caption: z.string().default(""),
  first_comment: z.string().default(""),
  hashtags: z.array(z.string().trim().min(1)).default([]),
  slides: z.array(linkedInSlideSchema).default([]),
  style: z.enum(["light", "dark"]),
  publish_as_profile_id: optionalUuid,
  status: z.enum(["draft", "approved", "published"]),
  scheduled_for: z
    .string()
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  linkedin_url: optionalText,
  scheduled_time: z
    .string()
    .optional()
    .transform((v) => (v && /^\d{2}:\d{2}/.test(v) ? v.slice(0, 5) : null)),
  news_item_id: optionalUuid,
  template_data: z.unknown().optional().transform((v) => (v === undefined ? null : v)),
});

export type LinkedInPostFormValues = z.infer<typeof linkedInPostFormSchema>;
