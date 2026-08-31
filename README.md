# Blog Crabsense

Sitio institucional + blog con panel de administración. Renderizado 100% en
el servidor (SSR): tanto el sitio público como el panel de admin obtienen
sus datos en cada request contra Supabase, sin fetch en el cliente.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- TypeScript
- Tailwind CSS v4
- [shadcn/ui](https://ui.shadcn.com) (componentes en `src/components/ui`)
- [Supabase](https://supabase.com) (Postgres + Auth) como base de datos y autenticación del admin
- Despliegue en [Vercel](https://vercel.com)

## Estructura

```
src/
  app/
    (site)/              # sitio público (SSR): home, /blog, /blog/[slug], categoría, tag
    admin/                # panel de administración (protegido, SSR)
      posts/              # CRUD de notas
      categories/         # CRUD de categorías
      tags/                # CRUD de tags
    login/                # login del admin (Supabase Auth)
  components/
    ui/                    # componentes shadcn/ui
    site/                  # componentes del sitio público
  lib/
    supabase/              # clientes de Supabase (browser, server, middleware)
    queries/                # funciones de lectura (posts, categories, tags)
    validations/            # esquemas zod para los formularios
supabase/
  schema.sql                # esquema de la base de datos + políticas RLS
middleware.ts                # protege /admin y refresca la sesión de Supabase
```

## 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com/dashboard) y creá un proyecto nuevo.
2. Andá a **Project Settings > API** y copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (solo se usa en el servidor, nunca la expongas al cliente)
3. Andá a **SQL Editor > New query**, pegá el contenido de `supabase/schema.sql` y ejecutalo. Esto crea las tablas (`posts`, `categories`, `tags`, `post_tags`, `profiles`) y las políticas de Row Level Security.
4. Creá tu usuario admin:
   - Entrá a `/login` en el sitio (una vez corriendo) o a **Authentication > Users** en Supabase y creá un usuario con email/contraseña.
   - En **Table Editor > profiles**, buscá la fila con tu `id` y cambiá `role` a `admin`.

### Login con Google (opcional)

El login de `/admin` soporta email/contraseña y Google OAuth. Solo los usuarios
con `role = 'admin'` en `profiles` pueden entrar al panel, sin importar el
método de login (esto lo aplica `middleware.ts` en cada request a `/admin`).

Para habilitar Google:

1. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   creá credenciales **OAuth client ID** de tipo **Web application**.
2. En **Authorized redirect URIs**, agregá:
   `https://<tu-project-ref>.supabase.co/auth/v1/callback`
   (la URL fija de callback de Supabase, no la de tu app).
3. En Supabase Dashboard, andá a **Authentication > Providers > Google**,
   activalo y pegá el **Client ID** y **Client Secret** de Google.
4. En **Authentication > URL Configuration > Redirect URLs**, agregá las URLs
   de tu app donde corras el login (ej. `http://localhost:3002/**` en local
   y tu dominio de producción), para que Supabase te deje redirigir de vuelta
   a `/auth/callback` después del login con Google.

## 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completá `.env.local` con los valores del paso anterior.

## 3. Correr en local

```bash
npm install
npm run dev
```

- Sitio público: http://localhost:3002
- Panel de administración: http://localhost:3002/admin (te redirige a `/login` si no iniciaste sesión)

## 4. Deploy en Vercel

1. Subí el repo a GitHub/GitLab/Bitbucket.
2. Importá el repo en [vercel.com/new](https://vercel.com/new).
3. En **Environment Variables**, cargá las mismas variables de `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` con la URL final).
4. Deploy. Cada push a la rama principal genera un nuevo deploy automáticamente.

## Notas

- Los tipos de Supabase en `src/lib/supabase/types.ts` son un placeholder.
  Una vez creado el proyecto, generá los tipos reales con:

  ```bash
  npx supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/types.ts
  ```

- El editor de contenido de las notas es un textarea simple. Si más
  adelante querés un editor WYSIWYG/Markdown, se puede agregar sin tocar el
  resto del admin.
