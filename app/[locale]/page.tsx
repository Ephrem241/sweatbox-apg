"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { HeroVideoSlider } from "@/components/home/HeroVideoSlider";
import { SERVICE_IMAGES } from "@/lib/brand-images";

const SERVICES = SERVICE_IMAGES.map((s) => ({ ...s, href: "/pricing" as const }));

const TestimonialsCarousel = dynamic(
  () => import("@/components/home/TestimonialsCarousel").then((m) => m.TestimonialsCarousel),
  {
    ssr: true,
    loading: () => (
      <section className="border-t bg-muted/30 py-12 md:py-16" aria-hidden>
        <div className="container px-4">
          <div className="mx-auto max-w-2xl animate-pulse rounded-lg bg-muted/50 py-24" />
        </div>
      </section>
    ),
  }
);

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col">
      <HeroVideoSlider />

      <section className="border-b bg-primary px-4 py-4 text-center">
        <p className="text-sm font-medium text-primary-foreground sm:text-base">
          {t("holidayOffer")}
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-2 min-h-[44px] touch-manipulation">
          <Link href="/pricing">{t("claimOffer")}</Link>
        </Button>
      </section>

      <section className="container px-4 py-16 md:py-24">
        <h2 className="font-display mb-10 text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl dark:text-accent">
          {t("servicesTitle")}
        </h2>
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {},
          }}
        >
          {SERVICES.map((service) => (
            <motion.div
              key={service.key}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-4/3 w-full">
                  <Image
                    src={service.src}
                    alt={t(service.key)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={80}
                  />
                </div>
                <CardHeader>
                  <CardTitle>{t(service.key)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t(`${service.key}Desc`)}
                  </p>
                  <Button asChild variant="link" className="mt-2 px-0" size="sm">
                    <Link href={service.href}>{t("learnMore")}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <TestimonialsCarousel />
    </div>
  );
}
