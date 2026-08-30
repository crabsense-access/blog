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
  is_featured: z.boolean().optional().default(false),
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
