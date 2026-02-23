"use client";

import Image from "next/image";
import { Instagram, Facebook, Twitter, Music2, MapPin, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrainerRating } from "@/components/trainers/TrainerRating";
import { useTranslations } from "next-intl";

export type TrainerProfileRow = {
  id: string;
  profile_id: string;
  display_name: string;
  bio: string | null;
  image_url: string | null;
  specialties: string[];
  sort_order: number;
  instagram_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  tiktok_url?: string | null;
  location_id?: string | null;
  locations?: { name: string } | null;
  average_rating?: number | null;
  rating_count?: number | null;
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
        {(trainer.locations?.name || (trainer.average_rating != null && trainer.rating_count != null && trainer.rating_count > 0)) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            {trainer.locations?.name && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {trainer.locations.name}
              </span>
            )}
            {trainer.average_rating != null && trainer.rating_count != null && trainer.rating_count > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-primary text-primary" aria-hidden />
                {Number(trainer.average_rating).toFixed(1)} ({trainer.rating_count})
              </span>
            )}
          </div>
        )}
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
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{trainer.bio}</p>
        )}
        {(trainer.instagram_url || trainer.facebook_url || trainer.twitter_url || trainer.tiktok_url) && (
          <div className="mb-3 flex flex-wrap gap-1">
            {trainer.instagram_url && (
              <a
                href={trainer.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="size-4" aria-hidden />
              </a>
            )}
            {trainer.facebook_url && (
              <a
                href={trainer.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="size-4" aria-hidden />
              </a>
            )}
            {trainer.twitter_url && (
              <a
                href={trainer.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter className="size-4" aria-hidden />
              </a>
            )}
            {trainer.tiktok_url && (
              <a
                href={trainer.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="TikTok"
              >
                <Music2 className="size-4" aria-hidden />
              </a>
            )}
          </div>
        )}
        <div className="mb-3">
          <TrainerRating trainerProfileId={trainer.id} />
        </div>
        <Button asChild className="w-full sm:w-auto" size="sm">
          <Link href="/schedule">{t("bookAClass")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
