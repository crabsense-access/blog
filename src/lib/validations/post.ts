import { z } from "zod";

export const postFaqFormSchema = z.object({
  question: z.string().min(1, "La pregunta no puede estar vacía."),
  answer: z.string().min(1, "La respuesta no puede estar vacía."),
});

export const postFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones."),
  excerpt: z.string().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  quick_answer: z.string().optional().or(z.literal("")),
  content: z.string().min(1, "El contenido no puede estar vacío."),
  status: z.enum(["draft", "published"]),
  category_id: z.string().uuid("Elegí una categoría principal."),
  author_id: z.string().uuid().optional().or(z.literal("")),
  is_featured: z.boolean().optional().default(false),
  is_popular: z.boolean().optional().default(false),
  featured_in_slider: z.boolean().optional().default(false),
  subcategory_ids: z.array(z.string().uuid()).optional().default([]),
  meta_title: z.string().max(70, "Máximo 70 caracteres.").optional().or(z.literal("")),
  meta_description: z.string().max(160, "Máximo 160 caracteres.").optional().or(z.literal("")),
  canonical_url: z.string().url("Tiene que ser una URL válida.").optional().or(z.literal("")),
  faqs: z.array(postFaqFormSchema).optional().default([]),
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

export const subcategoryFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres."),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones."),
  description: z.string().max(300).optional().or(z.literal("")),
  category_id: z.string().uuid("Elegí una categoría."),
  pill_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Tiene que ser un color hex válido.")
    .optional()
    .or(z.literal("")),
});

export type SubcategoryFormValues = z.infer<typeof subcategoryFormSchema>;

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
  bio: z.string().max(1000, "Máximo 1000 caracteres.").optional().or(z.literal("")),
  is_featured_expert: z.boolean().optional().default(false),
  featured_position: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
  linkedin_url: z.string().url("Tiene que ser una URL válida.").optional().or(z.literal("")),
});

export type AuthorFormValues = z.infer<typeof authorFormSchema>;

export const clientFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres."),
  row_number: z.coerce.number().int().min(1).max(3),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const siteSettingsFormSchema = z.object({
  category_page_initial_items: z.coerce.number().int().min(1).max(50),
  // Vacío = sin GTM instalado (el layout raíz no inyecta el script). Se
  // valida el formato típico "GTM-XXXXXXX" para evitar cargar un ID mal
  // tipeado, pero no se fuerza el campo a ser obligatorio.
  gtm_id: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^GTM-[A-Z0-9]+$/i.test(value), {
      message: 'Formato inválido. Tiene que ser del tipo "GTM-XXXXXXX".',
    }),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;
