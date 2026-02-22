import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminWorkoutVideosSection } from "@/components/admin/AdminWorkoutVideosSection";

type WorkoutVideoRow = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration_sec: number | null;
  tags: string[];
  sort_order: number;
  thumbnail_url: string | null;
};

type AdminWorkoutVideosPageProps = { params: Promise<{ locale: string }> };

export default async function AdminWorkoutVideosPage({ params }: AdminWorkoutVideosPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("workout_videos")
    .select("id, title, description, video_url, duration_sec, tags, sort_order, thumbnail_url")
    .order("sort_order")
    .order("title");
  const videos = (data ?? []) as unknown as WorkoutVideoRow[];
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Workout videos
      </h1>
      <AdminWorkoutVideosSection videos={videos} />
    </>
  );
}
