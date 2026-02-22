import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/auth/signin", locale });
  }
  const currentUser = user as NonNullable<typeof user>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", currentUser.id)
    .single();

  if (profile?.role !== "admin") {
    redirect({ href: "/dashboard", locale });
  }

  return (
    <div className="container px-4 py-10 md:py-16">
      <AdminNav />
      {children}
    </div>
  );
}
