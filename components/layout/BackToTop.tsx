"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const SCROLL_THRESHOLD_PX = 400;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-30 md:bottom-8 md:right-8"
        >
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="size-11 rounded-full shadow-lg min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <ChevronUp className="size-5" aria-hidden />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
