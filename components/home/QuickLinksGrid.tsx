"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const LINKS = [
  { href: "/classes", titleKey: "quickLinkClasses" as const, descKey: "quickLinkClassesDesc" as const },
  { href: "/pricing", titleKey: "quickLinkMemberships" as const, descKey: "quickLinkMembershipsDesc" as const },
  { href: "/locations", titleKey: "quickLinkLocations" as const, descKey: "quickLinkLocationsDesc" as const },
  { href: "/schedule", titleKey: "quickLinkSchedule" as const, descKey: "quickLinkScheduleDesc" as const },
  { href: "/contact", titleKey: "quickLinkContact" as const, descKey: "quickLinkContactDesc" as const },
] as const;

const viewport = { once: true, amount: 0.1 };

export function QuickLinksGrid() {
  const t = useTranslations("home");

  return (
    <motion.section
      className="container px-4 py-12 md:py-16"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <SectionHeading className="mb-8 text-center">
        {t("quickLinksTitle")}
      </SectionHeading>
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
          hidden: {},
        }}
      >
        {LINKS.map(({ href, titleKey, descKey }) => (
          <motion.div
            key={href}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Link href={href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <span className="font-semibold">{t(titleKey)}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
