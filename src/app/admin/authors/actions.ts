"use server";

import { revalidatePath } from "next/cache";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
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

/**
 * Elimina un autor. Antes pasa su contenido (notas, glosario, posts de
 * LinkedIn) a `reassignTo`, o lo deja sin autor si es null. Si el perfil
 * tiene usuario de login, también lo borra (si no, el perfil se volvería a
 * crear al entrar con esa cuenta).
 */
export async function deleteAuthor(id: string, reassignTo: string | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión." };
  if (user.id === id) return { error: "No podés eliminar tu propio perfil." };
  if (reassignTo === id) return { error: "Elegí otro autor para pasarle el contenido." };

  const { data: profile, error: readErr } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();
  if (readErr) return { error: readErr.message };
  if (!profile) return { error: "No se encontró el autor." };

  if (profile.role === "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) return { error: "Es el único admin: no se puede eliminar." };
  }

  const updates = [
    supabase.from("posts").update({ author_id: reassignTo }).eq("author_id", id),
    supabase.from("glossary_terms").update({ author_id: reassignTo }).eq("author_id", id),
    supabase.from("linkedin_posts").update({ publish_as_profile_id: reassignTo }).eq("publish_as_profile_id", id),
    supabase.from("linkedin_posts").update({ created_by: reassignTo }).eq("created_by", id),
  ];
  for (const res of await Promise.all(updates)) {
    // las tablas opcionales (glosario, LinkedIn) pueden no existir si falta la migración
    if (res.error && !/does not exist|schema cache/i.test(res.error.message)) {
      return { error: `No se pudo pasar el contenido: ${res.error.message}` };
    }
  }

  const { error: delErr } = await supabase.from("profiles").delete().eq("id", id);
  if (delErr) return { error: delErr.message };

  // usuario de login (los autores "solo de contenido" no tienen: se ignora)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createServiceRoleClient();
    const { error: authErr } = await admin.auth.admin.deleteUser(id);
    if (authErr && !/not found|not_found/i.test(authErr.message)) {
      console.error("deleteAuthor auth", authErr);
    }
  }

  revalidatePath("/admin/authors");
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
  return {};
}
