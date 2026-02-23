import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminTrainersSection } from "@/components/admin/AdminTrainersSection";

type TrainerRow = {
  id: string;
  profile_id: string;
  display_name: string;
  bio: string | null;
  image_url: string | null;
  specialties: string[];
  sort_order: number;
  location_id: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  tiktok_url: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

type AdminTrainersPageProps = { params: Promise<{ locale: string }> };

export default async function AdminTrainersPage({ params }: AdminTrainersPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const [
    { data: trainersData },
    { data: profilesData },
    { data: locationsData },
  ] = await Promise.all([
    admin
      .from("trainer_profiles")
      .select("id, profile_id, display_name, bio, image_url, specialties, sort_order, location_id, instagram_url, facebook_url, twitter_url, tiktok_url, profiles(full_name, email)")
      .order("sort_order")
      .order("display_name"),
    admin.from("profiles").select("id, full_name, email").order("full_name"),
    admin.from("locations").select("id, name").order("name"),
  ]);
  const trainers = (trainersData ?? []) as unknown as TrainerRow[];
  const profiles = (profilesData ?? []).map((p: { id: string; full_name: string | null; email: string | null }) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
  }));
  const locations = (locationsData ?? []).map((l: { id: string; name: string }) => ({ id: l.id, name: l.name }));
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Trainers
      </h1>
      <AdminTrainersSection trainers={trainers} profiles={profiles} locations={locations} />
    </>
  );
}
