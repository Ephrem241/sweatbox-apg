import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MembershipInquiryForm } from "@/components/forms/MembershipInquiryForm";

const BRANCHES = [
  { nameKey: "sarbet" as const, addressKey: "sarbetAddress" as const, phoneKey: "phone" as const },
  { nameKey: "bole" as const, addressKey: "boleAddress" as const, phoneKey: "phone" as const },
  { nameKey: "summit" as const, addressKey: "summitAddress" as const, phoneKey: "phone" as const },
] as const;

export default async function ContactPage() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-8 text-2xl font-bold tracking-tight md:text-3xl">
        {tNav("contact")}
      </h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Reach us at any of our locations or follow us on Instagram @sweatboxapg.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BRANCHES.map((branch) => (
          <Card key={branch.nameKey} className="border-muted">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t(branch.nameKey)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>{t(branch.addressKey)}</p>
              <p>
                <a
                  href={`tel:${t(branch.phoneKey).replace(/\s/g, "")}`}
                  className="hover:text-foreground"
                >
                  {t(branch.phoneKey)}
                </a>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-10 max-w-xl">
        <MembershipInquiryForm />
      </div>
    </div>
  );
}
