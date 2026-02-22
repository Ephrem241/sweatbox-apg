"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendMembershipInquiryEmail } from "@/app/actions/send-email";
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

const membershipInquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  preferredPlan: z.string().optional(),
  message: z.string().optional(),
});

type MembershipInquiryFormValues = z.infer<typeof membershipInquirySchema>;

export function MembershipInquiryForm() {
  const t = useTranslations("forms");
  const tM = useTranslations("membershipForm");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm<MembershipInquiryFormValues>({
    resolver: zodResolver(membershipInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredPlan: "",
      message: "",
    },
  });

  async function onSubmit(data: MembershipInquiryFormValues) {
    setStatus("idle");
    const result = await sendMembershipInquiryEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      preferredPlan: data.preferredPlan,
      message: data.message,
    });
    if ("error" in result) {
      setStatus("error");
      return;
    }
    setStatus("success");
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tM("title")}</CardTitle>
        <CardDescription>{tM("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mi-name">{t("name")}</Label>
              <Input
                id="mi-name"
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
              <Label htmlFor="mi-email">{t("email")}</Label>
              <Input
                id="mi-email"
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
            <Label htmlFor="mi-phone">{t("phone")}</Label>
            <Input
              id="mi-phone"
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
          <div className="space-y-2">
            <Label htmlFor="mi-plan">{tM("preferredPlan")}</Label>
            <Input
              id="mi-plan"
              placeholder={tM("preferredPlanPlaceholder")}
              {...form.register("preferredPlan")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mi-message">{t("message")}</Label>
            <textarea
              id="mi-message"
              placeholder={t("messagePlaceholder")}
              rows={3}
              className={cn(
                "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm",
                "aria-invalid:border-destructive"
              )}
              {...form.register("message")}
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
