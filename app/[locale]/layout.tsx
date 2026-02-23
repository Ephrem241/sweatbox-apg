import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonLdGym } from "@/components/seo/JsonLdGym";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAm = locale === "am";
  return {
    title: isAm
      ? "Sweatbox APG – የኢትዮጵያ የመጀመሪያ የተመዘገበ ክሮስፊት አፈጻጽማ ማእከል"
      : "Sweatbox APG – Ethiopia's First Accredited CrossFit Performance Center",
    description: isAm
      ? "በሳርበት፣ ቦሌ ወይም ሳምሚት ይስለቱ። ክሮስፊት፣ ጦርነት፣ የግል ስልጠና እና የወጣቶች ፕሮግራሞች። ማህበረሰቡን ይቀላቀሉ።"
      : "Train at Sarbet, Bole, or Summit. CrossFit, combat, personal training, and youth programs. Join the community.",
    keywords: ["Sweatbox Gym Addis Ababa", "CrossFit Addis Ababa", "gym Addis Ababa", "best gym Addis Ababa 2026"],
    openGraph: {
      title: "Sweatbox Gym Addis Ababa – Sweatbox APG",
      description:
        "Train at Sarbet, Bole, or Summit. CrossFit, combat, personal training, and youth programs in Addis Ababa.",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <JsonLdGym />
      <Navbar />
      <main id="main-content" className="flex-1">
        <TooltipProvider>{children}</TooltipProvider>
      </main>
      <Footer />
      <BackToTop />
    </NextIntlClientProvider>
  );
}
