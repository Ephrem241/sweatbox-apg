"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { PlanRow } from "@/components/pricing/pricing-plans";

const DURATIONS = [3, 6, 12] as const;

function formatETB(value: number): string {
  return `${value.toLocaleString("en")} ETB`;
}

type DetailsData = { name: string; email: string; phone: string };

type Props = { plans: PlanRow[] };

export function SignupFlow({ plans }: Props) {
  const t = useTranslations("signup");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [peak, setPeak] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(6);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [details, setDetails] = useState<DetailsData>({
    name: "",
    email: "",
    phone: "",
  });
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    const supabaseClient = createClient();
    (async () => {
      const { data: { user: u } } = await supabaseClient.auth.getUser();
      if (u) {
        setUser({ id: u.id });
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("full_name, email")
          .eq("id", u.id)
          .single();
        if (profile) {
          setDetails((prev) => ({
            ...prev,
            name: (profile.full_name as string) ?? prev.name,
            email: (profile.email as string) ?? prev.email,
          }));
        }
      }
      })();
  }, []);

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      const matchPeak = p.peak === null || p.peak === peak;
      const matchDuration = p.duration_months === duration;
      return matchPeak && matchDuration;
    });
  }, [plans, peak, duration]);

  const selectedPlan = useMemo(
    () => (selectedPlanId ? plans.find((p) => p.id === selectedPlanId) ?? null : null),
    [plans, selectedPlanId]
  );

  const canGoStep2 = selectedPlanId && filtered.some((p) => p.id === selectedPlanId);
  const canGoStep3 =
    details.name.trim() !== "" &&
    details.email.trim() !== "" &&
    details.phone.trim() !== "";

  async function handlePayWithChapa() {
    if (!selectedPlanId || !user) return;
    setPayLoading(true);
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: selectedPlanId, user_id: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Payment failed");
      const url = data.checkout_url;
      if (url && typeof url === "string") window.location.href = url;
      else throw new Error("No checkout URL");
    } catch {
      setPayLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Progress */}
      <nav aria-label="Progress" className="flex items-center justify-center gap-2">
        <StepLabel
          step={1}
          current={step}
          label={t("stepPlan")}
          onClick={() => setStep(1)}
        />
        <span className="text-muted-foreground">—</span>
        <StepLabel
          step={2}
          current={step}
          label={t("stepDetails")}
          onClick={() => step > 2 && setStep(2)}
        />
        <span className="text-muted-foreground">—</span>
        <StepLabel
          step={3}
          current={step}
          label={t("stepPayment")}
          onClick={() => step === 3 && setStep(3)}
        />
      </nav>

      {step === 1 && (
        <>
          <h2 className="text-lg font-semibold">{t("choosePlan")}</h2>
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {t("peak")} / {t("offPeak")}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={peak ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeak(true)}
                >
                  {t("peak")}
                </Button>
                <Button
                  variant={!peak ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeak(false)}
                >
                  {t("offPeak")}
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {t("duration")}
              </p>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <Button
                    key={d}
                    variant={duration === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDuration(d)}
                  >
                    {t("months", { n: d })}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">
              {t("noPlansMatch")}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPlanId === plan.id
                      ? "ring-2 ring-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {plan.duration_months}{" "}
                      {plan.duration_months === 1 ? t("month") : t("months", { n: plan.duration_months })}
                      {plan.peak !== null && (
                        <span> · {plan.peak ? t("peak") : t("offPeak")}</span>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">
                      {formatETB(plan.price_etb)}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanId(plan.id);
                        setStep(2);
                      }}
                      disabled={!plan.id}
                    >
                      {t("continue")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          {canGoStep2 && (
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>{t("nextDetails")}</Button>
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-lg font-semibold">{t("yourDetails")}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="su-name">{t("name")}</Label>
              <Input
                id="su-name"
                value={details.name}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, name: e.target.value }))
                }
                placeholder={t("name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="su-email">{t("email")}</Label>
              <Input
                id="su-email"
                type="email"
                value={details.email}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, email: e.target.value }))
                }
                placeholder={t("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="su-phone">{t("phone")}</Label>
              <Input
                id="su-phone"
                type="tel"
                value={details.phone}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, phone: e.target.value }))
                }
                placeholder={t("phone")}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              {t("back")}
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canGoStep3}
            >
              {t("nextPayment")}
            </Button>
          </div>
        </>
      )}

      {step === 3 && selectedPlan && (
        <>
          <h2 className="text-lg font-semibold">{t("paymentSummary")}</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selectedPlan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedPlan.duration_months}{" "}
                {selectedPlan.duration_months === 1 ? t("month") : t("months", { n: selectedPlan.duration_months })}
                {selectedPlan.peak !== null && (
                  <span> · {selectedPlan.peak ? t("peak") : t("offPeak")}</span>
                )}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatETB(selectedPlan.price_etb)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {details.name} · {details.email}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {user ? (
                <Button
                  className="w-full"
                  onClick={handlePayWithChapa}
                  disabled={payLoading}
                >
                  {payLoading ? t("processing") : t("payWithChapa")}
                </Button>
              ) : (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    {t("signInRequired")}
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">{t("signInToContinue")}</Link>
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setStep(2)}>
              {t("back")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function StepLabel({
  step,
  current,
  label,
  onClick,
}: {
  step: number;
  current: number;
  label: string;
  onClick: () => void;
}) {
  const isCurrent = current === step;
  const isPast = current > step;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium ${
        isCurrent
          ? "text-primary"
          : isPast
            ? "text-muted-foreground hover:text-foreground"
            : "text-muted-foreground"
      }`}
      aria-current={isCurrent ? "step" : undefined}
    >
      {step} — {label}
    </button>
  );
}
