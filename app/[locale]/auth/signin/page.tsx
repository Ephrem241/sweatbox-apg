import { Link } from "@/i18n/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { error: errorFromUrl } = await searchParams;
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-10">
      <SignInForm errorFromUrl={errorFromUrl === "auth" ? "authError" : undefined} />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
