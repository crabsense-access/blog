"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { authorFormSchema } from "@/lib/validations/post";
import { uploadPublicImage } from "@/lib/storage";

export interface AuthorFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateAuthorProfile(
  id: string,
  _prevState: AuthorFormState,
  formData: FormData
): Promise<AuthorFormState> {
  const parsed = authorFormSchema.safeParse({
    public_title: formData.get("public_title") ?? "",
    bio: formData.get("bio") ?? "",
    is_featured_expert: formData.get("is_featured_expert") === "on",
    featured_position: formData.get("featured_position") ?? "",
    linkedin_url: formData.get("linkedin_url") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { public_title, bio, is_featured_expert, featured_position, linkedin_url } = parsed.data;
  const supabase = await createClient();

  let avatar_url: string | undefined;
  const avatarFile = formData.get("avatar_file");

  if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      avatar_url = await uploadPublicImage(supabase, "avatars", avatarFile, id);
    } catch (e) {
      return { error: `No se pudo subir la imagen: ${(e as Error).message}` };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      public_title: public_title || null,
      bio: bio || null,
      is_featured_expert,
      featured_position: featured_position === "" ? null : featured_position,
      linkedin_url: linkedin_url || null,
      ...(avatar_url ? { avatar_url } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/authors");
  revalidatePath("/blog");
  return {};
}
