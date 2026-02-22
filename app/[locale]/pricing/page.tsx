import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  PricingPlans,
  type PlanRow,
} from "@/components/pricing/pricing-plans";

// Expected Supabase table "plans": id (uuid), name (text), peak (bool, nullable), duration_months (int), price_etb (int)

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: plans, error } = await supabase
    .from("plans")
    .select("id, name, peak, duration_months, price_etb")
    .order("price_etb", { ascending: true });

  if (error) {
    console.error("Pricing fetch error:", error);
  }

  return (
    <div className="container px-4 py-10 md:py-16">
      <SectionHeading as="h1" className="mb-2 text-center">
        Pricing
      </SectionHeading>
      <p className="mb-8 text-center text-muted-foreground">
        Choose your plan. All prices in ETB (Ethiopian Birr).
      </p>
      <PricingPlans plans={(plans ?? []) as PlanRow[]} />
    </div>
  );
}
