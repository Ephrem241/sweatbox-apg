import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminClassesSection } from "@/components/admin/AdminClassesSection";
import { DAY_LABELS } from "@/components/admin/ClassForm";

type ClassRow = {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  location_id: string | null;
  locations: { name: string } | null;
};

type AdminClassesPageProps = { params: Promise<{ locale: string }> };

export default async function AdminClassesPage({ params }: AdminClassesPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const [
    { data: classesData },
    { data: locationsData },
  ] = await Promise.all([
    admin
      .from("classes")
      .select("id, name, day_of_week, start_time, location_id, locations(name)")
      .order("day_of_week")
      .order("start_time"),
    admin.from("locations").select("id, name").order("name"),
  ]);
  const classes = (classesData ?? []) as unknown as ClassRow[];
  const locations = (locationsData ?? []).map((r: { id: string; name: string }) => ({
    id: r.id,
    name: r.name,
  }));
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Classes
      </h1>
      <AdminClassesSection classes={classes} locations={locations} />
    </>
  );
}
