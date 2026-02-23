"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { GALLERY_IMAGES } from "@/lib/brand-images";

const aboutTextVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
const aboutImageVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

export function AboutSection() {
  const t = useTranslations("home");
  const bullets = [
    t("aboutBullet1"),
    t("aboutBullet2"),
    t("aboutBullet3"),
    t("aboutBullet4"),
  ];
  const img1 = GALLERY_IMAGES[4];
  const img2 = GALLERY_IMAGES[5];

  return (
    <motion.section
      className="border-b border-border bg-background py-16 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
      }}
    >
      <div className="container grid gap-10 px-4 md:grid-cols-2 md:gap-12 lg:gap-16">
        <motion.div className="flex flex-col gap-4" variants={aboutTextVariants} transition={{ duration: 0.4, ease: "easeOut" }}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("aboutLabel")}
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
            {t("aboutTitle")}
          </h2>
          <p className="text-muted-foreground">
            {t("aboutBody")}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {bullets.map((label, i) => (
              <li key={i} className="flex items-center gap-2 text-foreground">
                <Check className="size-5 shrink-0 text-primary" aria-hidden />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div className="relative flex items-center justify-center gap-4" variants={aboutImageVariants} transition={{ duration: 0.45, ease: "easeOut" }}>
          <div className="relative aspect-4/5 w-full max-w-[280px] overflow-hidden rounded-lg shadow-lg">
            <Image
              src={img1.src}
              alt={t("aboutImage1Alt")}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 280px"
            />
          </div>
          <div className="relative aspect-4/5 w-full max-w-[240px] -translate-x-8 overflow-hidden rounded-lg shadow-lg md:max-w-[200px]">
            <Image
              src={img2.src}
              alt={t("aboutImage2Alt")}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 200px"
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
