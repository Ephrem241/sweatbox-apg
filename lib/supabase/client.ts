import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const missing = [
      !SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
      !SUPABASE_ANON_KEY && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `Supabase client missing required env: ${missing}. ` +
        "Add them to .env.local and restart the dev server. " +
        "Get values from: https://supabase.com/dashboard/project/_/settings/api"
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
