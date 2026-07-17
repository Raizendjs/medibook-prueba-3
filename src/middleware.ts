import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase/server";

// 🔒 Rutas que requieren estar logueado (y todo lo que empiece con ellas)
const PROTECTED_ROUTES = ["/dashboard", "/mis-reservas", "/mis-propiedades"];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // 🔥 IMPORTANTE: no interferir con OAuth callback
  if (url.pathname.startsWith("/auth/callback")) {
    return next();
  }

  const supabase = createSupabaseServerClient({
    request: context.request,
    cookies: context.cookies,
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  context.locals.user = user;

  // ¿La ruta actual es una ruta protegida?
  const isProtected = PROTECTED_ROUTES.some((route) =>
    url.pathname.startsWith(route)
  );

  if (isProtected && !user) {
    return context.redirect("/login/");
  }

  return next();
});