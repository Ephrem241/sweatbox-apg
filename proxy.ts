import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  if (response.status >= 300 && response.status < 400) return response;

  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const protectedMatch = pathname.match(/^\/(en|am)\/(dashboard|admin)(\/|$)/);
  if (!protectedMatch) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach((c) => response.cookies.set(c.name, c.value, c.options as object));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const locale = protectedMatch[1];

  if (!user) {
    url.pathname = `/${locale}/auth/signin`;
    return NextResponse.redirect(url);
  }

  if (pathname.includes("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      url.pathname = `/${locale}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export default proxy;

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
