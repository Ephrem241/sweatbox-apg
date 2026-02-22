import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Root path: redirect to default locale so / shows the real app.
 * Stops Vercel (or any host) from showing a default placeholder at /.
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
