"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSnackOrderAction } from "@/app/actions/snack-order";

type SnackItem = {
  id: string;
  name: string;
  description: string | null;
  price_etb: number;
  available: boolean;
};

type Location = {
  id: string;
  name: string;
};

type Props = {
  snackItems: SnackItem[];
  locations: Location[];
};

export function SnackOrderForm({ snackItems, locations }: Props) {
  const t = useTranslations("snackBar");
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [locationId, setLocationId] = useState("");
  const [pickupAt, setPickupAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const items = Object.entries(quantities)
      .filter(([, q]) => q > 0)
      .map(([snack_item_id, quantity]) => ({ snack_item_id, quantity }));
    const formData = new FormData();
    formData.set("location_id", locationId);
    formData.set("pickup_at", pickupAt);
    formData.set("notes", notes);
    formData.set("items", JSON.stringify(items));
    const result = await createSnackOrderAction({}, formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/account/pre-orders");
    router.refresh();
  }

  const availableItems = snackItems.filter((i) => i.available);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div>
        <Label htmlFor="location_id">{t("location")}</Label>
        <select
          id="location_id"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        >
          <option value="">{t("selectLocation")}</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="pickup_at">{t("pickupAt")}</Label>
        <Input
          id="pickup_at"
          type="datetime-local"
          value={pickupAt}
          onChange={(e) => setPickupAt(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>{t("items")}</Label>
        <ul className="mt-2 space-y-2">
          {availableItems.map((item) => (
            <li key={item.id} className="flex items-center gap-4">
              <span className="flex-1">{item.name} — {Number(item.price_etb).toLocaleString()} ETB</span>
              <Input
                type="number"
                min={0}
                className="w-20"
                value={quantities[item.id] ?? 0}
                onChange={(e) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [item.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                  }))
                }
              />
            </li>
          ))}
        </ul>
        {availableItems.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("noItems")}</p>
        )}
      </div>
      <div>
        <Label htmlFor="notes">{t("notes")}</Label>
        <Input
          id="notes"
          type="text"
          placeholder={t("notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={loading || availableItems.length === 0}>
        {loading ? t("submitting") : t("submitOrder")}
      </Button>
    </form>
  );
}
