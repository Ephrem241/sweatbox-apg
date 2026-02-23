"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { GALLERY_IMAGES, SERVICE_IMAGES } from "@/lib/brand-images";

const PROGRAMS = [
  {
    key: "classesProgramBodyBuilding" as const,
    descKey: "classesProgramBodyBuildingDesc" as const,
    src: GALLERY_IMAGES[0].src,
    alt: "Body building",
  },
  {
    key: "classesProgramPersonalTraining" as const,
    descKey: "classesProgramPersonalTrainingDesc" as const,
    src: SERVICE_IMAGES[2].src,
    alt: "Personal training",
  },
  {
    key: "classesProgramFitnessClass" as const,
    descKey: "classesProgramFitnessClassDesc" as const,
    src: GALLERY_IMAGES[4].src,
    alt: "Fitness class",
  },
  {
    key: "classesProgramGroupTraining" as const,
    descKey: "classesProgramGroupTrainingDesc" as const,
    src: GALLERY_IMAGES[2].src,
    alt: "Group training",
  },
] as const;

export function ClassesProgramSection() {
  const t = useTranslations("home");

  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="container px-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("classesProgramLabel")}
        </p>
        <div className="mt-2 border-b-2 border-primary pb-2 w-fit">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("classesProgramTitle")}
          </h2>
        </div>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {t("classesProgramSubtext")}
        </p>
        <motion.div
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {},
          }}
        >
          {PROGRAMS.map((program) => (
            <motion.div
              key={program.key}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="relative aspect-4/3 w-full">
                  <Image
                    src={program.src}
                    alt={program.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    quality={80}
                  />
                </div>
                <CardHeader>
                  <CardTitle>{t(program.key)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t(program.descKey)}
                  </p>
                  <Button asChild variant="default" className="mt-4" size="sm">
                    <Link href="/classes">{t("learnMore")}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
