"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const STATS = [
  { value: "759+", key: "statsSuccess" as const },
  { value: "74", key: "statsTrainers" as const },
  { value: "7.8K+", key: "statsMembers" as const },
  { value: "17+", key: "statsYears" as const },
] as const;

const statVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function StatsSection() {
  const t = useTranslations("home");

  return (
    <motion.section
      className="border-b border-border bg-muted/30 py-12 md:py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        visible: { transition: { staggerChildren: 0.08 } },
        hidden: {},
      }}
    >
      <div className="container grid grid-cols-2 gap-8 px-4 md:grid-cols-4 md:gap-6">
        {STATS.map(({ value, key }) => (
          <motion.div key={key} className="text-center" variants={statVariants} transition={{ duration: 0.35, ease: "easeOut" }}>
            <p className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(key)}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
