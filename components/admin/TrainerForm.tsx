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
  createTrainerAction,
  updateTrainerAction,
  type TrainerActionResult,
} from "@/app/admin/actions/trainers";

const trainerSchema = z.object({
  profile_id: z.string().min(1, "Member is required."),
  display_name: z.string().min(1, "Display name is required."),
  bio: z.string().optional(),
  image_url: z.string().optional(),
  specialties: z.string(), // comma-separated
  sort_order: z.coerce.number().min(0),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  twitter_url: z.string().optional(),
  tiktok_url: z.string().optional(),
  location_id: z.string().optional(),
});

type TrainerFormValues = z.infer<typeof trainerSchema>;

type ProfileOption = { id: string; full_name: string | null; email: string | null };

type LocationOption = { id: string; name: string };

type TrainerFormProps = {
  editId?: string | null;
  initialValues?: Partial<TrainerFormValues> | null;
  profiles: ProfileOption[];
  locations: LocationOption[];
  onSuccess?: () => void;
};

export function TrainerForm({
  editId,
  initialValues,
  profiles,
  locations,
  onSuccess,
}: TrainerFormProps) {
  const [state, setState] = useState<TrainerActionResult | null>(null);

  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerSchema) as Resolver<TrainerFormValues>,
    defaultValues: {
      profile_id: initialValues?.profile_id ?? "",
      display_name: initialValues?.display_name ?? "",
      bio: initialValues?.bio ?? "",
      image_url: initialValues?.image_url ?? "",
      specialties:
        Array.isArray(initialValues?.specialties)
          ? (initialValues.specialties as string[]).join(", ")
          : (initialValues?.specialties as string) ?? "",
      sort_order: initialValues?.sort_order ?? 0,
      instagram_url: initialValues?.instagram_url ?? "",
      facebook_url: initialValues?.facebook_url ?? "",
      twitter_url: initialValues?.twitter_url ?? "",
      tiktok_url: initialValues?.tiktok_url ?? "",
      location_id: initialValues?.location_id ?? "",
    },
  });

  async function onSubmit(data: TrainerFormValues) {
    setState(null);
    const specialties = data.specialties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      profile_id: data.profile_id,
      display_name: data.display_name,
      bio: data.bio || null,
      image_url: data.image_url || null,
      specialties,
      sort_order: data.sort_order,
      instagram_url: data.instagram_url?.trim() || null,
      facebook_url: data.facebook_url?.trim() || null,
      twitter_url: data.twitter_url?.trim() || null,
      tiktok_url: data.tiktok_url?.trim() || null,
      location_id: data.location_id?.trim() || null,
    };
    if (editId) {
      const result = await updateTrainerAction({ ...payload, id: editId });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const result = await createTrainerAction(payload);
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
        <Label htmlFor="trainer-profile">Member (profile)</Label>
        <Select
          value={form.watch("profile_id")}
          onValueChange={(v) => form.setValue("profile_id", v)}
        >
          <SelectTrigger id="trainer-profile">
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
        {form.formState.errors.profile_id && (
          <p className="text-sm text-destructive">{form.formState.errors.profile_id.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-display">Display name</Label>
        <Input id="trainer-display" {...form.register("display_name")} />
        {form.formState.errors.display_name && (
          <p className="text-sm text-destructive">{form.formState.errors.display_name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-bio">Bio</Label>
        <textarea
          id="trainer-bio"
          className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          {...form.register("bio")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-image">Image URL</Label>
        <Input id="trainer-image" {...form.register("image_url")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-specialties">Specialties (comma-separated)</Label>
        <Input id="trainer-specialties" placeholder="e.g. CrossFit, HIIT" {...form.register("specialties")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-location">Branch / Location</Label>
        <Select
          value={form.watch("location_id") || "none"}
          onValueChange={(v) => form.setValue("location_id", v === "none" ? "" : v)}
        >
          <SelectTrigger id="trainer-location">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No branch</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-sort">Sort order</Label>
        <Input id="trainer-sort" type="number" min={0} {...form.register("sort_order")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-instagram">Instagram URL</Label>
        <Input id="trainer-instagram" type="url" placeholder="https://instagram.com/username" {...form.register("instagram_url")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-facebook">Facebook URL</Label>
        <Input id="trainer-facebook" type="url" placeholder="https://facebook.com/username" {...form.register("facebook_url")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-twitter">Twitter URL</Label>
        <Input id="trainer-twitter" type="url" placeholder="https://twitter.com/username" {...form.register("twitter_url")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trainer-tiktok">TikTok URL</Label>
        <Input id="trainer-tiktok" type="url" placeholder="https://tiktok.com/@username" {...form.register("tiktok_url")} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : editId ? "Update trainer" : "Create trainer"}
      </Button>
    </form>
  );
}
