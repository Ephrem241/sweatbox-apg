import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { addMonths, startOfDay } from "date-fns";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function verifySignature(rawBody: string, secret: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}

function parseTxRef(txRef: string | undefined): { user_id: string; plan_id: string } | null {
  if (!txRef || typeof txRef !== "string") return null;
  const parts = txRef.split("|");
  if (parts.length < 4 || parts[0] !== "sweatbox") return null;
  const user_id = parts[1];
  const plan_id = parts[2];
  if (!UUID_REGEX.test(user_id) || !UUID_REGEX.test(plan_id)) return null;
  return { user_id, plan_id };
}

function parseShopTxRef(txRef: string | undefined): string | null {
  if (!txRef || typeof txRef !== "string") return null;
  const parts = txRef.split("|");
  if (parts.length < 3 || parts[0] !== "sweatbox" || parts[1] !== "shop") return null;
  const order_id = parts[2];
  if (!UUID_REGEX.test(order_id)) return null;
  return order_id;
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export async function POST(request: Request) {
  const webhookSecret =
    process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook is not configured (missing CHAPA_WEBHOOK_SECRET)." },
      { status: 500 }
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Failed to read body." }, { status: 400 });
  }

  const signature =
    request.headers.get("chapa-signature") ||
    request.headers.get("x-chapa-signature");
  if (!verifySignature(rawBody, webhookSecret, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: {
    event?: string;
    status?: string;
    tx_ref?: string;
    [key: string]: unknown;
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (event.event !== "charge.success" || event.status !== "success") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    console.error("[Chapa webhook] Service role client failed:", e);
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  const shopOrderId = parseShopTxRef(event.tx_ref);
  if (shopOrderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", shopOrderId)
      .single();
    if (order && order.status === "pending_payment") {
      await supabase.from("orders").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", shopOrderId);
      const { data: items } = await supabase.from("order_items").select("product_id, quantity").eq("order_id", shopOrderId);
      if (items) {
        for (const item of items) {
          const { data: prod } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
          const newStock = Math.max(0, (Number(prod?.stock) ?? 0) - item.quantity);
          await supabase.from("products").update({ stock: newStock, updated_at: new Date().toISOString() }).eq("id", item.product_id);
        }
      }
    }
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const parsed = parseTxRef(event.tx_ref);
  if (!parsed) {
    console.warn("[Chapa webhook] Invalid or missing tx_ref:", event.tx_ref);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const { user_id, plan_id } = parsed;

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id, duration_months")
    .eq("id", plan_id)
    .single();

  if (planError || !plan) {
    console.warn("[Chapa webhook] Plan not found:", plan_id);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const today = startOfDay(new Date());
  const endDate = addMonths(today, plan.duration_months);

  const endDateStr = endDate.toISOString().slice(0, 10);
  const { error: subError } = await supabase.from("subscriptions").insert({
    user_id,
    plan_id,
    status: "active",
    end_date: endDateStr,
  });

  if (subError) {
    console.error("[Chapa webhook] Subscription insert failed:", subError);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
