import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { startOfDay, parseISO, differenceInDays } from "date-fns";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

function today() {
  return startOfDay(new Date());
}

type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration_sec: number | null;
};

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/i.test(url);
}

function getEmbedUrl(url: string): string | null {
  if (isYouTubeUrl(url)) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  if (isVimeoUrl(url)) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
}

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function LibraryVideoPage({ params }: Props) {
  const { locale, id } = await params;
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
    redirect({ href: "/library", locale });
  }

  const { data, error } = await supabase
    .from("workout_videos")
    .select("id, title, description, video_url, duration_sec")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const video = data as VideoRow;

  const embedUrl = getEmbedUrl(video.video_url);

  return (
    <div className="container px-4 py-10 md:py-16">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/library">← {t("backToLibrary")}</Link>
      </Button>
      <h1 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
        {video.title}
      </h1>
      {video.description && (
        <p className="mb-6 text-muted-foreground">{video.description}</p>
      )}
      <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-muted">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={video.video_url}
            controls
            className="h-full w-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}
