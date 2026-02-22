import { getTranslations } from "next-intl/server";

export default async function BlogPage() {
  const t = await getTranslations("nav");
  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
        {t("blog")}
      </h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  );
}
