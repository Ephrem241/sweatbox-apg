"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendClassBookingEmail } from "@/app/actions/send-email";
import { bookClassAction } from "@/app/actions/book-class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const classBookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  className: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().optional(),
});

type ClassBookingFormValues = z.infer<typeof classBookingSchema>;

function toISODate(value: string): string | null {
  if (!value?.trim()) return null;
  const d = new Date(value.trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

type ClassBookingFormProps = {
  /** When provided and user is signed in, also insert into bookings after sending email. */
  classId?: string;
  /** Pass true when the current user is signed in so we can create a booking if classId is set. */
  isSignedIn?: boolean;
};

export function ClassBookingForm({ classId, isSignedIn }: ClassBookingFormProps = {}) {
  const t = useTranslations("forms");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm<ClassBookingFormValues>({
    resolver: zodResolver(classBookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      className: "",
      preferredDate: "",
      message: "",
    },
  });

  async function onSubmit(data: ClassBookingFormValues) {
    setStatus("idle");
    const result = await sendClassBookingEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      className: data.className,
      preferredDate: data.preferredDate,
      message: data.message,
    });
    if ("error" in result) {
      setStatus("error");
      return;
    }
    if (classId && isSignedIn && data.preferredDate) {
      const dateStr = toISODate(data.preferredDate);
      if (dateStr) {
        await bookClassAction(classId, dateStr);
      }
    }
    setStatus("success");
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("classBookingTitle")}</CardTitle>
        <CardDescription>{t("classBookingDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cb-name">{t("name")}</Label>
              <Input
                id="cb-name"
                placeholder={t("namePlaceholder")}
                {...form.register("name")}
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cb-email">{t("email")}</Label>
              <Input
                id="cb-email"
                type="email"
                placeholder={t("emailPlaceholder")}
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cb-phone">{t("phone")}</Label>
            <Input
              id="cb-phone"
              type="tel"
              placeholder={t("phonePlaceholder")}
              {...form.register("phone")}
              aria-invalid={!!form.formState.errors.phone}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cb-class">{t("className")}</Label>
              <Input
                id="cb-class"
                placeholder={t("classNamePlaceholder")}
                {...form.register("className")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cb-date">{t("preferredDate")}</Label>
              <Input
                id="cb-date"
                placeholder={t("preferredDatePlaceholder")}
                {...form.register("preferredDate")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cb-message">{t("message")}</Label>
            <textarea
              id="cb-message"
              placeholder={t("messagePlaceholder")}
              rows={3}
              className={cn(
                "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm",
                "aria-invalid:border-destructive"
              )}
              {...form.register("message")}
              aria-invalid={!!form.formState.errors.message}
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
