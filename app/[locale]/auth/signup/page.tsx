import { Link } from "@/i18n/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-10">
      <SignUpForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
