"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { authorFormSchema } from "@/lib/validations/post";

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
    is_featured_expert: formData.get("is_featured_expert") === "on",
    featured_position: formData.get("featured_position") ?? "",
    linkedin_url: formData.get("linkedin_url") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { public_title, is_featured_expert, featured_position, linkedin_url } = parsed.data;
  const supabase = await createClient();

  let avatar_url: string | undefined;
  const avatarFile = formData.get("avatar_file");

  if (avatarFile instanceof File && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });

    if (uploadError) {
      return { error: `No se pudo subir la imagen: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    avatar_url = publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      public_title: public_title || null,
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
