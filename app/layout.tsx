import type { Metadata, Viewport } from "next";
import { Poppins, Oswald } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SupabaseProvider } from "@/components/supabase/SupabaseProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sweatbox Gym Addis Ababa – CrossFit & Fitness | Sweatbox APG",
    template: "%s | Sweatbox Gym Addis Ababa",
  },
  description:
    "Sweatbox Gym Addis Ababa: Train at Sarbet, Bole, or Summit. CrossFit, combat, personal training, and youth programs. Ethiopia's first accredited CrossFit performance center.",
  keywords: ["Sweatbox Gym Addis Ababa", "CrossFit Addis Ababa", "gym Addis Ababa", "Sweatbox APG", "fitness Ethiopia", "best gym Addis Ababa 2026"],
  openGraph: {
    title: "Sweatbox Gym Addis Ababa – CrossFit & Fitness | Sweatbox APG",
    description:
      "Train at Sarbet, Bole, or Summit. CrossFit, combat, personal training, and youth programs in Addis Ababa.",
    type: "website",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${oswald.variable} flex min-h-screen flex-col antialiased font-sans`}
      >
        <ThemeProvider>
          <SupabaseProvider>{children}</SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
