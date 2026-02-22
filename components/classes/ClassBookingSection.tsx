"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ClassBookingForm } from "@/components/forms/ClassBookingForm";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClassOption = { id: string; name: string };

type Props = {
  classes: ClassOption[];
  isSignedIn: boolean;
};

const PLACEHOLDER_VALUE = "__none__";

export function ClassBookingSection({ classes, isSignedIn }: Props) {
  const t = useTranslations("forms");
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();

  return (
    <div className="space-y-6">
      {classes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="class-select">{t("selectClass")}</Label>
          <Select
            value={selectedClassId ?? PLACEHOLDER_VALUE}
            onValueChange={(value) =>
              setSelectedClassId(value === PLACEHOLDER_VALUE ? undefined : value)
            }
          >
            <SelectTrigger id="class-select" className="max-w-md">
              <SelectValue placeholder={t("selectClassPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PLACEHOLDER_VALUE}>{t("selectClassPlaceholder")}</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <ClassBookingForm
        classId={selectedClassId}
        isSignedIn={isSignedIn}
      />
    </div>
  );
}
