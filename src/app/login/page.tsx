import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "./login-form";
import { GoogleSignInButton } from "./google-signin-button";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  not_admin: "Tu cuenta de Google no tiene acceso al panel de administración.",
  auth_failed: "No se pudo completar el inicio de sesión. Probá de nuevo.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Panel de administración</CardTitle>
          <CardDescription>Ingresá con tu cuenta para gestionar el blog.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && ERROR_MESSAGES[error] && (
            <p className="text-sm text-destructive">{ERROR_MESSAGES[error]}</p>
          )}
          <GoogleSignInButton next={next} />
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">o con email</span>
            <Separator className="flex-1" />
          </div>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
