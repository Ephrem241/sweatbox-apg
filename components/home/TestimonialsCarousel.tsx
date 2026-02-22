"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const TESTIMONIAL_KEYS = [1, 2, 3] as const;
const ROTATE_MS = 6000;

export function TestimonialsCarousel() {
  const t = useTranslations("home");
  const [index, setIndex] = useState(0);
  const total = TESTIMONIAL_KEYS.length;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % total), ROTATE_MS);
    return () => clearInterval(id);
  }, [total]);

  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + total) % total);

  return (
    <motion.section
      className="border-t bg-muted/30 py-12 md:py-16"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="container px-4">
        <SectionHeading className="mb-8 text-center">
          {t("testimonialsTitle")}
        </SectionHeading>
        <div className="relative mx-auto max-w-2xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
            >
              <p className="text-lg leading-relaxed">
                &ldquo;{t(`testimonial${TESTIMONIAL_KEYS[index]}Quote` as const)}&rdquo;
              </p>
              <footer className="mt-4 flex items-center gap-2">
                <span className="font-semibold">
                  {t(`testimonial${TESTIMONIAL_KEYS[index]}Author` as const)}
                </span>
                <span className="text-muted-foreground">
                  — {t(`testimonial${TESTIMONIAL_KEYS[index]}Role` as const)}
                </span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous testimonial"
              onClick={() => go(-1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex gap-1">
              {TESTIMONIAL_KEYS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    i === index ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next testimonial"
              onClick={() => go(1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
