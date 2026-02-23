"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { SocialLinks } from "@/components/layout/SocialLinks";

const CONTACT_LOCATIONS = [
  { nameKey: "mainBranch" as const, addressKey: "mainBranchAddress" as const },
  { nameKey: "bisrateBranch" as const, addressKey: "bisrateBranchAddress" as const },
] as const;

const QUICK_LINKS = [
  { href: "/classes", titleKey: "quickLinkClasses" as const, descKey: "quickLinkClassesDesc" as const },
  { href: "/pricing", titleKey: "quickLinkMemberships" as const, descKey: "quickLinkMembershipsDesc" as const },
  { href: "/locations", titleKey: "quickLinkLocations" as const, descKey: "quickLinkLocationsDesc" as const },
  { href: "/schedule", titleKey: "quickLinkSchedule" as const, descKey: "quickLinkScheduleDesc" as const },
  { href: "/contact", titleKey: "quickLinkContact" as const, descKey: "quickLinkContactDesc" as const },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tNews = useTranslations("newsletter");
  const tHome = useTranslations("home");

  return (
    <footer className="border-t bg-muted/30">
      <div className="container max-w-full overflow-x-hidden px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-lg font-semibold text-foreground">
            {t("brand")}
          </Link>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-foreground">{tHome("quickLinksTitle")}</p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map(({ href, titleKey, descKey }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
                  <span className="font-medium">{tHome(titleKey)}</span>
                  <span className="ml-1">— {tHome(descKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-foreground">{t("followUs")}</p>
          <SocialLinks />
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-foreground">{tNews("title")}</p>
          <p className="mb-3 text-sm text-muted-foreground">{tNews("description")}</p>
          <NewsletterForm />
        </div>

        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
            {t("contactInfoTitle")}
          </p>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("ourLocations")}
          </p>
          <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
            {CONTACT_LOCATIONS.map((loc) => (
              <li key={loc.nameKey}>
                <span className="font-medium text-foreground">{t(loc.nameKey)}</span>
                <br />
                <span>{t(loc.addressKey)}</span>
              </li>
            ))}
          </ul>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("phoneNumbers")}
          </p>
          <ul className="mb-4 space-y-0.5 text-sm text-muted-foreground">
            <li>
              <a href="tel:+251911234567" className="hover:text-foreground">{t("phone1")}</a>
            </li>
            <li>
              <a href="tel:+251912345678" className="hover:text-foreground">{t("phone2")}</a>
            </li>
          </ul>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("emailAddresses")}
          </p>
          <ul className="mb-4 space-y-0.5 text-sm text-muted-foreground">
            <li>
              <a href="mailto:info@sweatboxgym.com" className="hover:text-foreground">{t("emailInfo")}</a>
            </li>
            <li>
              <a href="mailto:support@sweatboxgym.com" className="hover:text-foreground">{t("emailSupport")}</a>
            </li>
          </ul>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("openingHours")}
          </p>
          <ul className="space-y-0.5 text-sm text-muted-foreground">
            <li>{t("hoursWeekdays")}</li>
            <li>{t("hoursSaturday")}</li>
            <li>{t("hoursSunday")}</li>
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_LOCATIONS.map((branch) => (
            <Card key={branch.nameKey} className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t(branch.nameKey)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{t(branch.addressKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
