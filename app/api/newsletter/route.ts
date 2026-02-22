import { NextResponse } from "next/server";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

function getDataCenter(apiKey: string): string {
  const part = apiKey.split("-")[1];
  return part ?? "us1";
}

export async function POST(request: Request) {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
    return NextResponse.json(
      { error: "Newsletter is not configured." },
      { status: 500 }
    );
  }

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const dc = getDataCenter(MAILCHIMP_API_KEY);
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

  const payload = {
    email_address: email,
    status: "subscribed" as const,
    ...(name && { merge_fields: { FNAME: name } }),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 200 || res.status === 201) {
    return NextResponse.json({ success: true });
  }

  if (res.status === 400 && data.title === "Member Exists") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: data.detail || data.title || "Subscription failed." },
    { status: 502 }
  );
}
