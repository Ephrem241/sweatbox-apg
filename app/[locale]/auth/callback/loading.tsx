import { Loader2 } from "lucide-react";

export default function AuthCallbackLoading() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-10">
      <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
      <p className="mt-4 text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
