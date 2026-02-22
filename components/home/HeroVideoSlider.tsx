"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { HERO_SLIDES } from "@/lib/brand-images";

const SLIDE_DURATION_MS = 5000;

export function HeroVideoSlider() {
  const t = useTranslations("home");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-muted px-4 py-20 text-center md:min-h-[80vh]">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_SLIDES[current].src}
              alt={HERO_SLIDES[current].alt}
              fill
              className="object-cover"
              priority={current === 0}
              sizes="(max-width: 768px) 100vw, 100vw"
              quality={80}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-black/50" />
      <motion.div
        className="relative z-10 max-w-4xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-3 text-lg font-medium text-white/95 sm:text-xl">
          {t("missionSnippet")}
        </p>
        <p className="mt-2 text-base text-white/90 sm:text-lg">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="default" className="min-h-[44px] touch-manipulation">
            <Link href="/pricing">{t("joinNow")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-h-[44px] touch-manipulation border-white text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/locations">{t("findLocation")}</Link>
          </Button>
        </div>
      </motion.div>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center"
          >
            <span className={`h-2 w-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`} aria-hidden />
          </button>
        ))}
      </div>
    </section>
  );
}
