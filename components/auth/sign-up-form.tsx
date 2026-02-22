"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PHONE_PREFIX = "+251";

function toE164(nationalDigits: string): string {
  const digits = nationalDigits.replace(/\D/g, "").slice(0, 9);
  return `${PHONE_PREFIX}${digits}`;
}

const emailSchema = z.object({
  email: z.string().min(1, "Please enter your email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["member", "admin"]),
});

const phoneSendSchema = z.object({
  phoneNational: z
    .string()
    .refine((s) => s.replace(/\D/g, "").length >= 9, "Please enter a valid 9-digit phone number."),
});

const phoneVerifySchema = z.object({
  otpCode: z
    .string()
    .min(6, "Please enter the 6-digit code.")
    .max(6)
    .regex(/^\d{6}$/, "Please enter the 6-digit code."),
});

type EmailForm = z.infer<typeof emailSchema>;
type PhoneSendForm = z.infer<typeof phoneSendSchema>;
type PhoneVerifyForm = z.infer<typeof phoneVerifySchema>;

export function SignUpForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNational, setPhoneNational] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const fullPhone = toE164(phoneNational);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "", role: "member" },
  });

  const phoneSendForm = useForm<PhoneSendForm>({
    resolver: zodResolver(phoneSendSchema),
    defaultValues: { phoneNational: "" },
  });

  const phoneVerifyForm = useForm<PhoneVerifyForm>({
    resolver: zodResolver(phoneVerifySchema),
    defaultValues: { otpCode: "" },
  });

  async function onEmailSubmit(data: EmailForm) {
    setError(null);
    setLoading(true);
    const { data: authData, error: err } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: { data: { role: data.role } },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (authData.session && authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      const dest = profile?.role === "admin" ? "/admin" : profile?.role === "trainer" ? "/trainer" : "/dashboard";
      router.push(dest);
      router.refresh();
      return;
    }
    setEmailSent(true);
  }

  async function onPhoneSendSubmit(data: PhoneSendForm) {
    setError(null);
    setPhoneNational(data.phoneNational);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: toE164(data.phoneNational),
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setOtpSent(true);
  }

  async function onPhoneVerifySubmit(data: PhoneVerifyForm) {
    setError(null);
    setLoading(true);
    const { data: authData, error: err } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: data.otpCode.trim(),
      type: "sms",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (authData?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      const dest = profile?.role === "admin" ? "/admin" : profile?.role === "trainer" ? "/trainer" : "/dashboard";
      router.push(dest);
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  function switchToEmail() {
    setMode("email");
    setError(null);
    setOtpSent(false);
  }

  function switchToPhone() {
    setMode("phone");
    setError(null);
    setOtpSent(false);
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("checkEmail")}</CardTitle>
          <CardDescription>
            {t("checkEmailDescription", { email: emailForm.getValues("email") })}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/signin">{t("backToSignIn")}</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  async function onGoogleSignIn() {
    setError(null);
    setLoading(true);
    const baseUrl =
      (typeof window !== "undefined" && process.env.NEXT_PUBLIC_APP_URL?.trim()) ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const redirectTo = `${baseUrl}/auth/callback?next=/${locale}/dashboard`;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("signUp")}</CardTitle>
        <CardDescription>{t("signUpDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogleSignIn}
          disabled={loading}
        >
          {t("signInWithGoogle")}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
            <span className="bg-card px-2">{t("orContinueWith")}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "email" ? "default" : "outline"}
            size="sm"
            onClick={switchToEmail}
          >
            {t("email")}
          </Button>
          <Button
            type="button"
            variant={mode === "phone" ? "default" : "outline"}
            size="sm"
            onClick={switchToPhone}
          >
            {t("phone")}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {mode === "email" && (
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>{t("role")}</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="member"
                    {...emailForm.register("role")}
                    className="rounded-full border-input"
                  />
                  <span className="text-sm">{t("roleMember")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="admin"
                    {...emailForm.register("role")}
                    className="rounded-full border-input"
                  />
                  <span className="text-sm">{t("roleAdmin")}</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">{t("email")}</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={loading}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">{t("password")}</Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                disabled={loading}
                {...emailForm.register("password")}
              />
              {emailForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("creatingAccount") : t("signUp")}
            </Button>
          </form>
        )}

        {mode === "phone" && !otpSent && (
          <form
            onSubmit={phoneSendForm.handleSubmit(onPhoneSendSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="signup-phone">{t("phone")}</Label>
              <div className="flex rounded-md border border-input shadow-xs focus-within:ring-ring/50 focus-within:ring-[3px]">
                <span className="flex items-center border-r border-input bg-muted px-3 text-sm text-muted-foreground">
                  {PHONE_PREFIX}
                </span>
                <Input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel-national"
                  placeholder="91 234 5678"
                  disabled={loading}
                  className="border-0 bg-transparent focus-visible:ring-0"
                  {...phoneSendForm.register("phoneNational")}
                />
              </div>
              {phoneSendForm.formState.errors.phoneNational && (
                <p className="text-sm text-destructive">
                  {phoneSendForm.formState.errors.phoneNational.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                (phoneSendForm.watch("phoneNational")?.replace(/\D/g, "").length ?? 0) < 9
              }
            >
              {loading ? t("sendingCode") : t("sendCode")}
            </Button>
          </form>
        )}

        {mode === "phone" && otpSent && (
          <form
            onSubmit={phoneVerifyForm.handleSubmit(onPhoneVerifySubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="signup-otp">{t("verificationCode")}</Label>
              <Input
                id="signup-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                disabled={loading}
                {...phoneVerifyForm.register("otpCode", {
                  onChange: (e) =>
                    phoneVerifyForm.setValue(
                      "otpCode",
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    ),
                })}
              />
              {phoneVerifyForm.formState.errors.otpCode && (
                <p className="text-sm text-destructive">
                  {phoneVerifyForm.formState.errors.otpCode.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("verifying") : t("verify")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setOtpSent(false);
                phoneVerifyForm.reset();
              }}
            >
              {t("differentNumber")}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <p className="text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("signIn")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
