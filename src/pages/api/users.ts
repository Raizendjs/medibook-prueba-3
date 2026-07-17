import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const GET: APIRoute = async () => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return new Response(
      JSON.stringify({
        error: "ENV missing (URL or SERVICE_ROLE_KEY)",
        url,
        key: !!key,
      }),
      { status: 500 }
    );
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(data.users), {
    headers: { "Content-Type": "application/json" },
  });
};