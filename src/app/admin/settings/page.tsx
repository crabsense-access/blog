import { redirect } from "next/navigation";

import { getHomeBanner } from "@/lib/queries/home-banner";
import { createClient } from "@/lib/supabase/server";
import { HomeBannerForm } from "./home-banner-form";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [banner, { data: profile }] = await Promise.all([
    getHomeBanner(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Banner destacado que aparece en la home, junto al artículo destacado.
        </p>
        <div className="mt-6">
          <HomeBannerForm banner={banner} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Tu perfil</h2>
        <p className="text-sm text-muted-foreground">
          Información que se muestra públicamente junto a tus notas.
        </p>
        <div className="mt-6">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
