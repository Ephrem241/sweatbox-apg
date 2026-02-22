"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createMembershipAction,
  updateMembershipAction,
  type MembershipActionResult,
} from "@/app/admin/actions/memberships";

const membershipSchema = z.object({
  user_id: z.string().min(1, "Member is required."),
  plan_id: z.string().min(1, "Plan is required."),
  status: z.string().min(1),
  start_date: z.string().min(1, "Start date is required."),
  end_date: z.string().min(1, "End date is required."),
});

type MembershipFormValues = z.infer<typeof membershipSchema>;

type ProfileOption = { id: string; full_name: string | null; email: string | null };
type PlanOption = { id: string; name: string };

type MembershipFormProps = {
  editId?: string | null;
  initialValues?: Partial<MembershipFormValues> | null;
  profiles: ProfileOption[];
  plans: PlanOption[];
  onSuccess?: () => void;
};

const STATUS_OPTIONS = ["active", "cancelled", "expired"];

export function MembershipForm({
  editId,
  initialValues,
  profiles,
  plans,
  onSuccess,
}: MembershipFormProps) {
  const [state, setState] = useState<MembershipActionResult | null>(null);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema) as Resolver<MembershipFormValues>,
    defaultValues: {
      user_id: initialValues?.user_id ?? "",
      plan_id: initialValues?.plan_id ?? "",
      status: initialValues?.status ?? "active",
      start_date: initialValues?.start_date ?? "",
      end_date: initialValues?.end_date ?? "",
    },
  });

  async function onSubmit(data: MembershipFormValues) {
    setState(null);
    const payload = {
      user_id: data.user_id,
      plan_id: data.plan_id,
      status: data.status,
      start_date: data.start_date,
      end_date: data.end_date,
    };
    if (editId) {
      const result = await updateMembershipAction({ ...payload, id: editId });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const result = await createMembershipAction(payload);
    if (result?.error) {
      setState(result);
      return;
    }
    onSuccess?.();
  }

  function profileLabel(p: ProfileOption) {
    return [p.full_name, p.email].filter(Boolean).join(" — ") || p.id.slice(0, 8);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="mem-user">Member</Label>
        <Select value={form.watch("user_id")} onValueChange={(v) => form.setValue("user_id", v)}>
          <SelectTrigger id="mem-user">
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {profileLabel(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.user_id && (
          <p className="text-sm text-destructive">{form.formState.errors.user_id.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mem-plan">Plan</Label>
        <Select value={form.watch("plan_id")} onValueChange={(v) => form.setValue("plan_id", v)}>
          <SelectTrigger id="mem-plan">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.plan_id && (
          <p className="text-sm text-destructive">{form.formState.errors.plan_id.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mem-status">Status</Label>
        <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v)}>
          <SelectTrigger id="mem-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mem-start">Start date</Label>
        <Input id="mem-start" type="date" {...form.register("start_date")} />
        {form.formState.errors.start_date && (
          <p className="text-sm text-destructive">{form.formState.errors.start_date.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mem-end">End date</Label>
        <Input id="mem-end" type="date" {...form.register("end_date")} />
        {form.formState.errors.end_date && (
          <p className="text-sm text-destructive">{form.formState.errors.end_date.message}</p>
        )}
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : editId ? "Update membership" : "Create membership"}
      </Button>
    </form>
  );
}
