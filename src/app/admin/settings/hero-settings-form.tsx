"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSuccessToast } from "@/lib/use-success-toast";
import type { SiteSettings } from "@/lib/types";
import { updateHeroSettings, type HeroSettingsFormState } from "./actions";

const initialState: HeroSettingsFormState = {};

export function HeroSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateHeroSettings, initialState);
  useSuccessToast(state, initialState);

  return (
    <form action={formAction} className="grid max-w-lg gap-6">
      <div className="grid gap-2">
        <Label htmlFor="hero_pill_text">Pill</Label>
        <Input
          id="hero_pill_text"
          name="hero_pill_text"
          type="text"
          maxLength={60}
          placeholder="Agencia de marketing digital con IA"
          defaultValue={settings.hero_pill_text ?? ""}
        />
        <p className="text-sm text-muted-foreground">
          Etiqueta chica que aparece arriba de todo en el hero. Dejala vacía para ocultarla.
        </p>
        {state.fieldErrors?.hero_pill_text && (
          <p className="text-sm text-destructive">{state.fieldErrors.hero_pill_text[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="hero_title">Titular</Label>
        <Textarea
          id="hero_title"
          name="hero_title"
          rows={2}
          maxLength={120}
          placeholder="Esto es una prueba desde el admin"
          defaultValue={settings.hero_title ?? ""}
        />
        <p className="text-sm text-muted-foreground">
          Titular grande (H1 de la home), debajo de la pill. Dejalo vacío para ocultarlo.
        </p>
        {state.fieldErrors?.hero_title && (
          <p className="text-sm text-destructive">{state.fieldErrors.hero_title[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
