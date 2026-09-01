"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Profile } from "@/lib/types";
import { updateAuthorProfile, type AuthorFormState } from "./actions";

const initialState: AuthorFormState = {};

export function AuthorDialog({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const action = updateAuthorProfile.bind(null, profile.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state !== initialState && !state.error && !state.fieldErrors) {
      setOpen(false);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar autor: {profile.full_name ?? profile.email}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`avatar_file-${profile.id}`}>Foto</Label>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Vista previa"
                className="size-16 rounded-full object-cover"
              />
            )}
            <Input
              id={`avatar_file-${profile.id}`}
              name="avatar_file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`public_title-${profile.id}`}>Cargo público</Label>
            <Input
              id={`public_title-${profile.id}`}
              name="public_title"
              defaultValue={profile.public_title ?? ""}
              placeholder="Ej: Head of SEO"
            />
            {state.fieldErrors?.public_title && (
              <p className="text-sm text-destructive">{state.fieldErrors.public_title[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`bio-${profile.id}`}>Bio</Label>
            <Textarea
              id={`bio-${profile.id}`}
              name="bio"
              defaultValue={profile.bio ?? ""}
              rows={3}
              placeholder="Breve descripción del autor..."
            />
            {state.fieldErrors?.bio && (
              <p className="text-sm text-destructive">{state.fieldErrors.bio[0]}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`is_featured_expert-${profile.id}`}
              name="is_featured_expert"
              defaultChecked={profile.is_featured_expert}
            />
            <Label
              htmlFor={`is_featured_expert-${profile.id}`}
              className="font-normal cursor-pointer"
            >
              Destacar en bloque de expertos
            </Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`featured_position-${profile.id}`}>Posición (1 a 5)</Label>
            <Input
              id={`featured_position-${profile.id}`}
              name="featured_position"
              type="number"
              min={1}
              max={5}
              defaultValue={profile.featured_position ?? ""}
            />
            {state.fieldErrors?.featured_position && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.featured_position[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`linkedin_url-${profile.id}`}>LinkedIn</Label>
            <Input
              id={`linkedin_url-${profile.id}`}
              name="linkedin_url"
              defaultValue={profile.linkedin_url ?? ""}
              placeholder="https://linkedin.com/in/..."
            />
            {state.fieldErrors?.linkedin_url && (
              <p className="text-sm text-destructive">{state.fieldErrors.linkedin_url[0]}</p>
            )}
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
