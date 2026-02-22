"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Menu } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { navGroups } from "@/lib/nav-links";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/app/actions/auth";

type AuthState = { role: string | null } | null;

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function isGroupActive(pathname: string, links: readonly { href: string }[]): boolean {
  return links.some(({ href }) => isLinkActive(pathname, href));
}

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const supabase = createClient();
    async function updateAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuth(null);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setAuth({ role: profile?.role ?? null });
    }
    updateAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => updateAuth());
    return () => subscription.unsubscribe();
  }, [mounted]);

  async function handleLogout() {
    await signOutAction();
    setAuth(null);
    router.push("/");
  }

  const switchLocale = () => {
    const next = locale === "en" ? "am" : "en";
    router.replace(pathname, { locale: next });
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            {t("brand")}
          </Link>
          <div className="hidden md:block h-9 w-24" aria-hidden />
          <div className="flex md:hidden items-center gap-2">
            <div className="h-9 w-9" aria-hidden />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          {t("brand")}
        </Link>

        <nav
          className="hidden md:flex md:items-center md:gap-2 lg:gap-4"
          aria-label="Main navigation"
        >
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navGroups.map((group) => {
                const groupActive = isGroupActive(pathname, group.links);
                return (
                  <NavigationMenuItem key={group.labelKey}>
                    <NavigationMenuTrigger
                      className={cn(
                        "bg-transparent",
                        groupActive && "text-primary"
                      )}
                    >
                      {t(group.labelKey)}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-1 p-2 md:w-[220px]">
                        {group.links.map(({ href, labelKey }) => {
                          const active = isLinkActive(pathname, href);
                          return (
                            <li key={href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={href}
                                  className={cn(
                                    "block select-none rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    active ? "bg-accent/50 text-primary" : "text-foreground"
                                  )}
                                >
                                  {t(labelKey)}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={switchLocale}
            className="text-xs"
          >
            {locale === "en" ? "አማ" : "EN"}
          </Button>
          {auth ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  navigationMenuTriggerStyle(),
                  "text-sm font-medium transition-colors",
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("dashboard")}
              </Link>
              {auth.role === "admin" && (
                <Link
                  href="/admin"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-sm font-medium transition-colors",
                    pathname === "/admin" || pathname.startsWith("/admin/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("admin")}
                </Link>
              )}
              {auth.role === "trainer" && (
                <Link
                  href="/trainer"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-sm font-medium transition-colors",
                    pathname === "/trainer" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("trainer")}
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t("logout")}
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/signin">{t("login")}</Link>
            </Button>
          )}
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={switchLocale}
            className="text-xs"
          >
            {locale === "en" ? "አማ" : "EN"}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:max-w-[280px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-4 pt-4"
                aria-label="Mobile navigation"
              >
                {navGroups.map((group) => (
                  <div key={group.labelKey}>
                    <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(group.labelKey)}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {group.links.map(({ href, labelKey }) => {
                        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                          <SheetClose asChild key={href}>
                            <Link
                              href={href}
                              className={cn(
                                "flex min-h-[44px] w-full touch-manipulation items-center rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                isActive ? "text-primary font-semibold bg-accent/50" : "text-foreground"
                              )}
                            >
                              {t(labelKey)}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {auth ? (
                  <>
                    <p className="mb-1.5 mt-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Account
                    </p>
                    <div className="flex flex-col gap-0.5">
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="flex min-h-[44px] w-full touch-manipulation items-center rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-foreground"
                        >
                          {t("dashboard")}
                        </Link>
                      </SheetClose>
                      {auth.role === "admin" && (
                        <SheetClose asChild>
                          <Link
                            href="/admin"
                            className="flex min-h-[44px] w-full touch-manipulation items-center rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-foreground"
                          >
                            {t("admin")}
                          </Link>
                        </SheetClose>
                      )}
                      {auth.role === "trainer" && (
                        <SheetClose asChild>
                          <Link
                            href="/trainer"
                            className="flex min-h-[44px] w-full touch-manipulation items-center rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-foreground"
                          >
                            {t("trainer")}
                          </Link>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Button variant="outline" className="mt-2 w-full" onClick={handleLogout}>
                          {t("logout")}
                        </Button>
                      </SheetClose>
                    </div>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Button asChild variant="default" className="mt-4 w-full">
                      <Link href="/auth/signin">{t("login")}</Link>
                    </Button>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
