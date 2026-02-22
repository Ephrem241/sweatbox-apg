"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export type TrainerProfileRow = {
  id: string;
  profile_id: string;
  display_name: string;
  bio: string | null;
  image_url: string | null;
  specialties: string[];
  sort_order: number;
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80";

type TrainerCardProps = {
  trainer: TrainerProfileRow;
};

export function TrainerCard({ trainer }: TrainerCardProps) {
  const t = useTranslations("trainers");
  const imageUrl = trainer.image_url?.trim() || PLACEHOLDER_IMAGE;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-4/3 w-full shrink-0 bg-muted">
        <Image
          src={imageUrl}
          alt={trainer.display_name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold leading-tight">{trainer.display_name}</h3>
        {trainer.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {trainer.specialties.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        {trainer.bio && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{trainer.bio}</p>
        )}
        <Button asChild className="w-full sm:w-auto" size="sm">
          <Link href="/schedule">{t("bookAClass")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
