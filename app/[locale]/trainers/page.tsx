import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { TrainerCard, type TrainerProfileRow } from "@/components/trainers/TrainerCard";

export default async function TrainersPage() {
  const t = await getTranslations("trainers");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainer_profiles")
    .select("id, profile_id, display_name, bio, image_url, specialties, sort_order")
    .order("sort_order", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    console.error("Trainer profiles fetch error:", error);
  }

  const trainers = (data ?? []) as TrainerProfileRow[];

  return (
    <div className="container px-4 py-10 md:py-16">
      <SectionHeading as="h1" className="mb-2">
        {t("title")}
      </SectionHeading>
      <p className="mb-10 max-w-2xl text-muted-foreground">
        {t("subtitle")}
      </p>
      {trainers.length === 0 ? (
        <p className="text-muted-foreground">{t("noTrainers")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
