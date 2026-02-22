import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next")?.slice(0, 256) ?? "/en/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectTo = next.startsWith("/") ? `${requestUrl.origin}${next}` : `${requestUrl.origin}/en/dashboard`;
      return NextResponse.redirect(redirectTo);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/en/auth/signin?error=auth`);
}
