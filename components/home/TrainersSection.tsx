import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { TrainerCard, type TrainerProfileRow } from "@/components/trainers/TrainerCard";

const HOME_TRAINERS_LIMIT = 3;

export async function TrainersSection() {
  const t = await getTranslations("home");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainer_profiles")
    .select("id, profile_id, display_name, bio, image_url, specialties, sort_order, instagram_url, facebook_url, twitter_url, tiktok_url, location_id, average_rating, rating_count, locations(name)")
    .order("sort_order", { ascending: true })
    .order("display_name", { ascending: true })
    .limit(HOME_TRAINERS_LIMIT);

  if (error) {
    console.error("TrainersSection fetch error:", error);
  }

  const trainers = (data ?? []) as TrainerProfileRow[];

  if (trainers.length === 0) return null;

  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="container px-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("trainersSectionTitle")}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("trainersSectionSubtitle")}
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/trainers">{t("seeAllTrainers")}</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      </div>
    </section>
  );
}
