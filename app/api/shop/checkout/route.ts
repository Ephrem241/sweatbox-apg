import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CHAPA_INIT_URL = "https://api.chapa.co/v1/transaction/initialize";

function splitName(fullName: string | null): { first_name: string; last_name: string } {
  if (!fullName?.trim()) return { first_name: "Customer", last_name: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment is not configured (missing CHAPA_SECRET_KEY)." },
      { status: 500 }
    );
  }

  let body: { items?: Array<{ product_id: string; quantity: number }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "At least one item with product_id and quantity is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to checkout." }, { status: 401 });
  }

  const profile = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();
  const email = (profile.data as { email?: string | null } | null)?.email?.trim();
  if (!email) {
    return NextResponse.json(
      { error: "Profile email is required for payment." },
      { status: 400 }
    );
  }

  const productIds = [...new Set(items.map((i) => i.product_id))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price_etb, stock")
    .in("id", productIds);

  if (productsError || !products?.length) {
    return NextResponse.json({ error: "Products not found." }, { status: 404 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalEtb = 0;
  const orderItems: { product_id: string; quantity: number; price_etb: number }[] = [];

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product || item.quantity < 1) continue;
    const qty = Math.min(item.quantity, product.stock);
    if (qty < 1) continue;
    const price = Number(product.price_etb);
    orderItems.push({ product_id: product.id, quantity: qty, price_etb: price });
    totalEtb += price * qty;
  }

  if (orderItems.length === 0 || totalEtb <= 0) {
    return NextResponse.json(
      { error: "No valid items or insufficient stock." },
      { status: 400 }
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending_payment",
      total_etb: totalEtb,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message || "Failed to create order." },
      { status: 500 }
    );
  }

  const chapaTxRef = `sweatbox|shop|${order.id}`;
  await supabase.from("orders").update({ chapa_tx_ref: chapaTxRef }).eq("id", order.id);

  for (const oi of orderItems) {
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: oi.product_id,
      quantity: oi.quantity,
      price_etb: oi.price_etb,
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  const { first_name, last_name } = splitName(
    (profile.data as { full_name?: string | null } | null)?.full_name ?? null
  );

  const payload = {
    amount: String(Math.round(totalEtb)),
    currency: "ETB",
    email,
    first_name,
    last_name,
    tx_ref: chapaTxRef,
    ...(baseUrl && {
      callback_url: `${baseUrl}/api/payment/callback`,
      return_url: `${baseUrl}/account/orders`,
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

  return NextResponse.json({ checkout_url: checkoutUrl, order_id: order.id });
}
