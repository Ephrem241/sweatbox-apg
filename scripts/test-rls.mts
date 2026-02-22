/**
 * RLS test script: verifies that member User B cannot SELECT or UPDATE
 * another member User A's data in profiles, memberships, bookings, check_ins.
 *
 * Requires env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL),
 *               SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
 *               TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD,
 *               TEST_USER_B_EMAIL, TEST_USER_B_PASSWORD.
 * Run: npx tsx scripts/test-rls.mts
 */

import { createClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const userAEmail = process.env.TEST_USER_A_EMAIL;
const userAPassword = process.env.TEST_USER_A_PASSWORD;
const userBEmail = process.env.TEST_USER_B_EMAIL;
const userBPassword = process.env.TEST_USER_B_PASSWORD;

function env(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const supabaseUrl = env("SUPABASE_URL | NEXT_PUBLIC_SUPABASE_URL", url);
  const supabaseAnonKey = env("SUPABASE_ANON_KEY | NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", anonKey);
  env("TEST_USER_A_EMAIL", userAEmail);
  env("TEST_USER_A_PASSWORD", userAPassword);
  env("TEST_USER_B_EMAIL", userBEmail);
  env("TEST_USER_B_PASSWORD", userBPassword);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in as User A and get their id
  const { data: dataA, error: signInAError } = await supabase.auth.signInWithPassword({
    email: userAEmail!,
    password: userAPassword!,
  });
  if (signInAError || !dataA.user) {
    console.error("Sign in as User A failed:", signInAError?.message ?? "no user");
    process.exit(1);
  }
  const userAId = dataA.user.id;
  console.log("User A id:", userAId);

  // Sign in as User B (new client session)
  const { data: dataB, error: signInBError } = await supabase.auth.signInWithPassword({
    email: userBEmail!,
    password: userBPassword!,
  });
  if (signInBError || !dataB.user) {
    console.error("Sign in as User B failed:", signInBError?.message ?? "no user");
    process.exit(1);
  }
  console.log("User B signed in; testing RLS as User B against User A data...\n");

  let failed = false;

  // profiles: SELECT by id = User A
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userAId);
  if (profiles && profiles.length > 0) {
    console.error("FAIL: profiles – User B saw User A's profile");
    failed = true;
  } else {
    console.log("OK: profiles SELECT – User B cannot see User A's profile");
  }

  // profiles: UPDATE (try to update User A's profile)
  const { data: updProfiles } = await supabase
    .from("profiles")
    .update({ full_name: "Hacked" })
    .eq("id", userAId)
    .select("id");
  if (updProfiles && updProfiles.length > 0) {
    console.error("FAIL: profiles – User B updated User A's profile");
    failed = true;
  } else {
    console.log("OK: profiles UPDATE – User B cannot update User A's profile");
  }

  // memberships: SELECT by user_id = User A
  const { data: memberships } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", userAId);
  if (memberships && memberships.length > 0) {
    console.error("FAIL: memberships – User B saw User A's memberships");
    failed = true;
  } else {
    console.log("OK: memberships SELECT – User B cannot see User A's memberships");
  }

  // memberships: UPDATE
  const { data: updMemberships } = await supabase
    .from("memberships")
    .update({ status: "cancelled" })
    .eq("user_id", userAId)
    .select("id");
  if (updMemberships && updMemberships.length > 0) {
    console.error("FAIL: memberships – User B updated User A's membership");
    failed = true;
  } else {
    console.log("OK: memberships UPDATE – User B cannot update User A's membership");
  }

  // bookings: SELECT by user_id = User A
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", userAId);
  if (bookings && bookings.length > 0) {
    console.error("FAIL: bookings – User B saw User A's bookings");
    failed = true;
  } else {
    console.log("OK: bookings SELECT – User B cannot see User A's bookings");
  }

  // bookings: UPDATE
  const { data: updBookings } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("user_id", userAId)
    .select("id");
  if (updBookings && updBookings.length > 0) {
    console.error("FAIL: bookings – User B updated User A's booking");
    failed = true;
  } else {
    console.log("OK: bookings UPDATE – User B cannot update User A's booking");
  }

  // check_ins: SELECT by user_id = User A
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("id")
    .eq("user_id", userAId);
  if (checkIns && checkIns.length > 0) {
    console.error("FAIL: check_ins – User B saw User A's check_ins");
    failed = true;
  } else {
    console.log("OK: check_ins SELECT – User B cannot see User A's check_ins");
  }

  if (failed) {
    console.error("\nSome RLS checks failed.");
    process.exit(1);
  }
  console.log("\nAll RLS checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
