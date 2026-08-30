import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/types";

// Server Component / Server Action / Route Handler client.
// Reads and writes the auth cookie so the session stays in sync on every
// request — this is what makes the public site and the admin panel SSR
// (data is fetched per-request on the server, not via client-side effects).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component (no cookie write access).
            // Safe to ignore as long as middleware.ts refreshes sessions.
          }
        },
      },
    }
  );
}

// Admin-only client using the service role key. Never import this in
// client components or expose the key with a NEXT_PUBLIC_ prefix.
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
