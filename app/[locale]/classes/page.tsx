import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClassBookingSection } from "@/components/classes/ClassBookingSection";

export default async function ClassesPage() {
  const t = await getTranslations("nav");
  const supabase = await createClient();

  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name")
    .order("name");

  const classes = (classesData ?? []).map((r) => ({ id: r.id, name: r.name }));

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
        {t("classes")}
      </h1>
      <p className="mb-6 max-w-2xl text-muted-foreground">
        View our class schedule and book your session. We offer CrossFit, combat, and
        specialty classes throughout the week.
      </p>
      <Link
        href="/schedule"
        className="mb-8 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        View schedule
      </Link>
      <div className="max-w-xl">
        <ClassBookingSection classes={classes} isSignedIn={isSignedIn} />
      </div>
    </div>
  );
}
