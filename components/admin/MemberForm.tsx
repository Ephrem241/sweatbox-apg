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
import { updateMemberAction, type MemberActionResult } from "@/app/admin/actions/members";

const memberSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().optional(),
  role: z.enum(["member", "admin"]),
});

type MemberFormValues = z.infer<typeof memberSchema>;

type MemberFormProps = {
  memberId: string;
  initialValues: MemberFormValues;
  onSuccess?: () => void;
};

export function MemberForm({ memberId, initialValues, onSuccess }: MemberFormProps) {
  const [state, setState] = useState<MemberActionResult | null>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema) as Resolver<MemberFormValues>,
    defaultValues: {
      full_name: initialValues.full_name ?? "",
      email: initialValues.email ?? "",
      role: initialValues.role ?? "member",
    },
  });

  async function onSubmit(data: MemberFormValues) {
    setState(null);
    const result = await updateMemberAction({
      id: memberId,
      full_name: data.full_name || null,
      email: data.email || null,
      role: data.role,
    });
    if (result?.error) {
      setState(result);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="member-name">Full name</Label>
        <Input id="member-name" {...form.register("full_name")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="member-email">Email</Label>
        <Input id="member-email" type="email" {...form.register("email")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="member-role">Role</Label>
        <Select
          value={form.watch("role")}
          onValueChange={(v) => form.setValue("role", v as "member" | "admin")}
        >
          <SelectTrigger id="member-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Update member"}
      </Button>
    </form>
  );
}
