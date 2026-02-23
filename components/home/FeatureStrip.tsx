"use client";

import { ChevronRight, UserRound, Dumbbell } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const stripVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function FeatureStrip() {
  const t = useTranslations("home");

  return (
    <motion.section
      className="border-b border-border bg-muted/50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        visible: { transition: { staggerChildren: 0.08 } },
        hidden: {},
      }}
    >
      <div className="container grid gap-0 sm:grid-cols-3">
        <motion.div variants={stripVariants} transition={{ duration: 0.35, ease: "easeOut" }}>
        <Button
          asChild
          variant="ghost"
          className="flex h-auto flex-col items-start gap-2 rounded-none border-b border-border py-6 text-left sm:border-b-0 sm:border-r sm:py-8"
        >
          <Link href="/pricing" className="flex w-full items-center justify-between gap-2 px-6">
            <span className="font-semibold text-foreground">
              {t("featureStrip.joinOffer")}
            </span>
            <ChevronRight className="size-5 shrink-0 text-primary" aria-hidden />
          </Link>
        </Button>
        </motion.div>
        <motion.div variants={stripVariants} transition={{ duration: 0.35, ease: "easeOut" }} className="flex flex-col items-start gap-2 border-b border-border px-6 py-6 sm:border-b-0 sm:border-r sm:py-8">
          <UserRound className="size-10 text-primary" aria-hidden />
          <h3 className="font-semibold text-foreground">
            {t("featureStrip.certifiedTrainer")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("featureStrip.certifiedTrainerDesc")}
          </p>
        </motion.div>
        <motion.div variants={stripVariants} transition={{ duration: 0.35, ease: "easeOut" }} className="flex flex-col items-start gap-2 px-6 py-6 sm:py-8">
          <Dumbbell className="size-10 text-primary" aria-hidden />
          <h3 className="font-semibold text-foreground">
            {t("featureStrip.qualityEquipment")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("featureStrip.qualityEquipmentDesc")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
