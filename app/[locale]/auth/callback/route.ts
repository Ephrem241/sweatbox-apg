import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next")?.slice(0, 256) ?? `/${locale}/dashboard`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectTo = next.startsWith("/") ? `${requestUrl.origin}${next}` : `${requestUrl.origin}/${locale}/dashboard`;
      return NextResponse.redirect(redirectTo);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/${locale}/auth/signin?error=auth`);
}
