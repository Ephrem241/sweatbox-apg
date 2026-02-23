"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { submitTrainerRatingAction } from "@/app/actions/trainer-rating";

type TrainerRatingProps = {
  trainerProfileId: string;
};

export function TrainerRating({ trainerProfileId }: TrainerRatingProps) {
  const t = useTranslations("trainers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRate(rating: number) {
    setError(null);
    setLoading(true);
    const result = await submitTrainerRatingAction(trainerProfileId, rating);
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground">{t("rateThisTrainer")}</p>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            disabled={loading}
            onClick={() => handleRate(value)}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-primary disabled:opacity-50"
            aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
          >
            <Star className="size-5" aria-hidden />
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
