"use client";

import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "./auth-actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm" className="gap-2">
        <LogOutIcon className="size-4" />
        Salir
      </Button>
    </form>
  );
}
