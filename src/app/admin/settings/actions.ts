"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { homeBannerFormSchema, profileFormSchema, siteSettingsFormSchema } from "@/lib/validations/post";

export interface HomeBannerFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateHomeBanner(
  _prevState: HomeBannerFormState,
  formData: FormData
): Promise<HomeBannerFormState> {
  const parsed = homeBannerFormSchema.safeParse({
    title: formData.get("title"),
    image_url: formData.get("image_url") ?? "",
    link_url: formData.get("link_url") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { title, image_url, link_url } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_banner")
    .update({
      title,
      image_url: image_url || null,
      link_url: link_url || null,
    })
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return {};
}

export interface ProfileFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = profileFormSchema.safeParse({
    public_title: formData.get("public_title") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No hay sesión activa." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ public_title: parsed.data.public_title || null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/blog");
  revalidatePath("/");
  return {};
}

export interface SiteSettingsFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateSiteSettings(
  _prevState: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  const parsed = siteSettingsFormSchema.safeParse({
    category_page_initial_items: formData.get("category_page_initial_items"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update(parsed.data)
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/blog/categoria/[slug]", "page");
  return {};
}
