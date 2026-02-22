import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { startOfDay, parseISO, differenceInDays } from "date-fns";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function today() {
  return startOfDay(new Date());
}

type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  duration_sec: number | null;
  tags: string[];
  sort_order: number;
};

const PLACEHOLDER_THUMB = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80";

type Props = { params: Promise<{ locale: string }> };

export default async function LibraryPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("library");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/auth/signin", locale });
  }
  const currentUser = user as NonNullable<typeof user>;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, status, end_date")
    .eq("user_id", currentUser.id)
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const endDate = sub?.end_date ? startOfDay(parseISO(String(sub.end_date))) : null;
  const isActive =
    !!sub &&
    sub.status === "active" &&
    endDate !== null &&
    (endDate > today() || differenceInDays(endDate, today()) === 0);

  if (!isActive) {
    return (
      <div className="container px-4 py-10 md:py-16">
        <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="mb-6 text-muted-foreground">
          {t("membersOnly")}
        </p>
        <Button asChild>
          <Link href="/pricing">{t("joinOrRenew")}</Link>
        </Button>
      </div>
    );
  }

  const { data: videos, error } = await supabase
    .from("workout_videos")
    .select("id, title, description, thumbnail_url, video_url, duration_sec, tags, sort_order")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) console.error("Library fetch error:", error);
  const videoList = (videos ?? []) as unknown as VideoRow[];

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        {t("title")}
      </h1>
      <p className="mb-10 text-muted-foreground">
        {t("subtitle")}
      </p>
      {videoList.length === 0 ? (
        <p className="text-muted-foreground">{t("noVideos")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videoList.map((video) => (
            <Link key={video.id} href={`/library/${video.id}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-video w-full bg-muted">
                  <Image
                    src={video.thumbnail_url?.trim() || PLACEHOLDER_THUMB}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {video.duration_sec != null && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                      {Math.floor(video.duration_sec / 60)}:{(video.duration_sec % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold leading-tight">{video.title}</h3>
                </CardHeader>
                {video.description && (
                  <CardContent className="pt-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
