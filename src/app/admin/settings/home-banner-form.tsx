"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HomeBanner } from "@/lib/types";
import { updateHomeBanner, type HomeBannerFormState } from "./actions";

const initialState: HomeBannerFormState = {};

export function HomeBannerForm({ banner }: { banner: HomeBanner }) {
  const [state, formAction, pending] = useActionState(updateHomeBanner, initialState);

  return (
    <form action={formAction} className="grid max-w-lg gap-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" defaultValue={banner.title} required />
        {state.fieldErrors?.title && (
          <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image_url">Imagen de fondo (URL)</Label>
        <Input
          id="image_url"
          name="image_url"
          defaultValue={banner.image_url ?? ""}
          placeholder="https://..."
        />
        {state.fieldErrors?.image_url && (
          <p className="text-sm text-destructive">{state.fieldErrors.image_url[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="link_url">Link del banner</Label>
        <Input
          id="link_url"
          name="link_url"
          defaultValue={banner.link_url ?? ""}
          placeholder="https://..."
        />
        {state.fieldErrors?.link_url && (
          <p className="text-sm text-destructive">{state.fieldErrors.link_url[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
