"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const newsletterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  name: z.string().optional(),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", name: "" },
  });

  async function onSubmit(data: NewsletterFormValues) {
    setStatus("idle");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, name: data.name }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="newsletter-email" className="text-sm">
          {t("emailLabel")}
        </Label>
        <div className="flex gap-2">
          <Input
            id="newsletter-email"
            type="email"
            placeholder={t("emailPlaceholder")}
            className="flex-1"
            {...form.register("email")}
            aria-invalid={!!form.formState.errors.email}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("submitting") : t("subscribe")}
          </Button>
        </div>
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newsletter-name" className="text-sm text-muted-foreground">
          {t("nameLabel")} (optional)
        </Label>
        <Input
          id="newsletter-name"
          placeholder={t("namePlaceholder")}
          className="max-w-xs"
          {...form.register("name")}
        />
      </div>
      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {t("success")}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">{t("error")}</p>
      )}
    </form>
  );
}
