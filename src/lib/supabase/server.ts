import { createServerClient } from "@supabase/ssr";
import { parseCookieHeader } from "@supabase/ssr";

export function createSupabaseServerClient({ request, cookies }) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";

  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              ...options,
              path: "/",
              sameSite: "lax",
              secure: isHttps, // false en localhost http, true en producción https
              httpOnly: false, // debe ser accesible desde el navegador para que el cliente lea la sesión
            });
          });
        },
      },
    }
  );
}