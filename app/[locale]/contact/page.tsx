import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MembershipInquiryForm } from "@/components/forms/MembershipInquiryForm";
import { SocialLinks } from "@/components/layout/SocialLinks";

const CONTACT_LOCATIONS = [
  { nameKey: "mainBranch" as const, addressKey: "mainBranchAddress" as const },
  { nameKey: "bisrateBranch" as const, addressKey: "bisrateBranchAddress" as const },
] as const;

export default async function ContactPage() {
  const t = await getTranslations("footer");
  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        {t("contactInfoTitle")}
      </h1>
      <p className="mb-4 max-w-2xl text-muted-foreground">
        Reach us at any of our locations, by phone, or email.
      </p>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-foreground">{t("followUs")}</p>
        <SocialLinks />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t("ourLocations")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACT_LOCATIONS.map((branch) => (
            <Card key={branch.nameKey} className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t(branch.nameKey)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{t(branch.addressKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">{t("phoneNumbers")}</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <a href="tel:+251911234567" className="hover:text-foreground">{t("phone1")}</a>
            </li>
            <li>
              <a href="tel:+251912345678" className="hover:text-foreground">{t("phone2")}</a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">{t("emailAddresses")}</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <a href="mailto:info@sweatboxgym.com" className="hover:text-foreground">{t("emailInfo")}</a>
            </li>
            <li>
              <a href="mailto:support@sweatboxgym.com" className="hover:text-foreground">{t("emailSupport")}</a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">{t("openingHours")}</h2>
          <ul className="space-y-0.5 text-sm text-muted-foreground">
            <li>{t("hoursWeekdays")}</li>
            <li>{t("hoursSaturday")}</li>
            <li>{t("hoursSunday")}</li>
          </ul>
        </div>
      </section>

      <div className="max-w-xl">
        <MembershipInquiryForm />
      </div>
    </div>
  );
}
