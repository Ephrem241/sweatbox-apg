import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("nav");
  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
        {t("about")}
      </h1>
      <p className="max-w-2xl text-muted-foreground">
        Sweatbox APG is Ethiopia&apos;s first accredited CrossFit performance center. We offer
        CrossFit, combat fitness, personal training, and youth programs at our locations in
        Sarbet, Bole, and Summit. Our mission is to help you take control of your body and
        reach your fitness goals in a supportive community.
      </p>
    </div>
  );
}
