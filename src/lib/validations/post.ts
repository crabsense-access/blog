import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones."),
  excerpt: z.string().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  content: z.string().min(1, "El contenido no puede estar vacío."),
  cover_image_url: z.string().url("Tiene que ser una URL válida.").optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  category_id: z.string().uuid().optional().or(z.literal("")),
  author_id: z.string().uuid().optional().or(z.literal("")),
  is_featured: z.boolean().optional().default(false),
  is_popular: z.boolean().optional().default(false),
  tag_ids: z.array(z.string().uuid()).optional().default([]),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres."),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones."),
  description: z.string().max(300).optional().or(z.literal("")),
  pill_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Tiene que ser un color hex válido.")
    .optional()
    .or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const tagFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres."),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones."),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;

export const homeBannerFormSchema = z.object({
  title: z.string().min(1, "El título no puede estar vacío."),
  image_url: z.string().url("Tiene que ser una URL válida.").optional().or(z.literal("")),
  link_url: z.string().url("Tiene que ser una URL válida.").optional().or(z.literal("")),
});

export type HomeBannerFormValues = z.infer<typeof homeBannerFormSchema>;

export const profileFormSchema = z.object({
  public_title: z.string().max(100, "Máximo 100 caracteres.").optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const categoryBlockFormSchema = z.object({
  category_id: z.string().uuid().optional().or(z.literal("")),
});

export type CategoryBlockFormValues = z.infer<typeof categoryBlockFormSchema>;

export const authorFormSchema = z.object({
  public_title: z.string().max(100, "Máximo 100 caracteres.").optional().or(z.literal("")),
  is_featured_expert: z.boolean().optional().default(false),
  featured_position: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
  linkedin_url: z.string().url("Tiene que ser una URL válida.").optional().or(z.literal("")),
});

export type AuthorFormValues = z.infer<typeof authorFormSchema>;
