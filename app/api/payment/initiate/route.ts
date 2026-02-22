import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CHAPA_INIT_URL = "https://api.chapa.co/v1/transaction/initialize";

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

function splitName(fullName: string | null): { first_name: string; last_name: string } {
  if (!fullName?.trim()) return { first_name: "Customer", last_name: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  const first_name = parts[0];
  const last_name = parts.slice(1).join(" ");
  return { first_name, last_name };
}

export async function POST(request: Request) {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment is not configured (missing CHAPA_SECRET_KEY)." },
      { status: 500 }
    );
  }

  let body: { plan_id?: string; user_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { plan_id, user_id } = body;
  if (!plan_id || !user_id || typeof plan_id !== "string" || typeof user_id !== "string") {
    return NextResponse.json(
      { error: "plan_id and user_id are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const [planResult, profileResult] = await Promise.all([
    supabase.from("plans").select("id, name, price_etb").eq("id", plan_id).single(),
    supabase.from("profiles").select("id, full_name, email").eq("id", user_id).single(),
  ]);

  if (planResult.error || !planResult.data) {
    return NextResponse.json(
      { error: "Plan not found." },
      { status: 404 }
    );
  }
  if (profileResult.error || !profileResult.data) {
    return NextResponse.json(
      { error: "User profile not found." },
      { status: 404 }
    );
  }

  const plan = planResult.data;
  const profile = profileResult.data as { id: string; full_name: string | null; email?: string | null };
  const email = profile.email?.trim();
  if (!email) {
    return NextResponse.json(
      { error: "User email is required for payment. Ensure profiles has an email or sync from auth." },
      { status: 400 }
    );
  }

  const { first_name, last_name } = splitName(profile.full_name);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  const txRef = `sweatbox|${user_id}|${plan_id}|${Date.now()}`;

  const payload = {
    amount: String(plan.price_etb),
    currency: "ETB",
    email,
    first_name,
    last_name,
    tx_ref: txRef,
    ...(baseUrl && {
      callback_url: `${baseUrl}/api/payment/callback`,
      return_url: `${baseUrl}/dashboard`,
    }),
  };

  const chapaRes = await fetch(CHAPA_INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await chapaRes.json().catch(() => ({}));

  if (!chapaRes.ok) {
    return NextResponse.json(
      { error: data.message || data.error || "Chapa request failed." },
      { status: 502 }
    );
  }

  const checkoutUrl = data.data?.checkout_url;
  if (!checkoutUrl || typeof checkoutUrl !== "string") {
    return NextResponse.json(
      { error: "Chapa did not return a checkout URL." },
      { status: 502 }
    );
  }

  return NextResponse.json({ checkout_url: checkoutUrl });
}
