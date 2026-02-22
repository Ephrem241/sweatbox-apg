import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SignupFlow } from "@/components/memberships/SignupFlow";
import type { PlanRow } from "@/components/pricing/pricing-plans";

export default async function MembershipsPage() {
  const t = await getTranslations("signup");
  const supabase = await createClient();
  const { data: plans, error } = await supabase
    .from("plans")
    .select("id, name, peak, duration_months, price_etb")
    .order("price_etb", { ascending: true });

  if (error) {
    console.error("Memberships plans fetch error:", error);
  }

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-center text-2xl font-bold tracking-tight md:text-3xl">
        {t("title")}
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        {t("subtitle")}
      </p>
      <SignupFlow plans={(plans ?? []) as PlanRow[]} />
    </div>
  );
}
