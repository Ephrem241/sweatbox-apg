# RLS Testing: Members Cannot Access Other Users' Data

This document describes how to verify that Row Level Security (RLS) correctly restricts members so they cannot see or modify other users' data in `profiles`, `memberships`, `bookings`, or `check_ins`.

## Goal

With the **anon** key and a **member** JWT, that member must not be able to:

- **SELECT** another member's rows in `profiles`, `memberships`, `bookings`, or `check_ins`.
- **UPDATE** another member's rows in those tables.

Admins (role `admin` in `profiles`) can read and manage all rows; this checklist focuses on member-vs-member isolation.

---

## Option A: Manual Testing Checklist

Use two real member accounts (User A and User B). Do **not** use an admin account for these tests.

### Prerequisites

- Two member accounts (User A, User B) in your Supabase project.
- User A has at least one row that User B must not see: e.g. one booking, one membership, and their profile. Create a booking as User A from the Schedule page if needed.

### 1. Bookings

1. Sign in as **User A** in the app and create a class booking (Schedule → Book Class).
2. Note User A’s user id (e.g. from Supabase Dashboard → Authentication → User A, or from the app if you have a debug display).
3. Sign in as **User B**.
4. In the browser console (or a temporary debug page that uses the Supabase client with the current session), run:

   ```js
   // Replace USER_A_ID with User A's UUID
   const { data, error } = await supabase
     .from('bookings')
     .select('*')
     .eq('user_id', 'USER_A_ID');
   console.log('data', data, 'error', error);
   ```

5. **Expected:** `data` is an empty array (no rows). User B must not see User A’s bookings.
6. Try an update as User B on User A’s booking (use a known booking id from step 1 if you have it from another source):

   ```js
   const { data, error } = await supabase
     .from('bookings')
     .update({ status: 'cancelled' })
     .eq('user_id', 'USER_A_ID')
     .select();
   console.log('data', data, 'error', error);
   ```

7. **Expected:** No rows updated (`data` empty or zero rows affected). User B must not be able to update User A’s bookings.

### 2. Memberships

1. As **User B**, in the console:

   ```js
   const { data } = await supabase
     .from('memberships')
     .select('*')
     .eq('user_id', 'USER_A_ID');
   console.log('data', data);
   ```

2. **Expected:** Empty array. User B must not see User A’s memberships.
3. Try an update as User B on User A’s membership (e.g. change `status` or `end_date`). **Expected:** No rows updated.

### 3. Profiles

1. As **User B**:

   ```js
   const { data } = await supabase
     .from('profiles')
     .select('*')
     .eq('id', 'USER_A_ID');
   console.log('data', data);
   ```

2. **Expected:** Empty array. User B must not see User A’s profile.
3. Try updating User A’s profile (e.g. `full_name`) as User B. **Expected:** No rows updated.

### 4. Check-ins

1. Ensure User A has at least one check-in (or create one via an admin if needed).
2. As **User B**:

   ```js
   const { data } = await supabase
     .from('check_ins')
     .select('*')
     .eq('user_id', 'USER_A_ID');
   console.log('data', data);
   ```

3. **Expected:** Empty array. User B must not see User A’s check-ins.
4. Members do not have INSERT/DELETE on `check_ins` (only admins do); if you expose an update path, verify User B cannot update User A’s check-ins.

### Summary

- For each table (`bookings`, `memberships`, `profiles`, `check_ins`), User B must get **no rows** when selecting by User A’s id and must **not** be able to update User A’s rows.
- Re-run these checks after any change to RLS policies or related roles.

---

## Option B: Automated Test Script

A Node script can run the same checks using two test users and the Supabase client.

### Setup

1. Create two **member** test users in Supabase (Auth → Users), or use existing members. Do not use admin accounts.
2. Set environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` – project URL  
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY` – anon key  
   - `TEST_USER_A_EMAIL`, `TEST_USER_A_PASSWORD` – User A credentials  
   - `TEST_USER_B_EMAIL`, `TEST_USER_B_PASSWORD` – User B credentials  

3. Ensure User A has at least one row in `bookings` and `memberships` (and a profile) so we can reference their ids. The script will sign in as User A to get their id, then sign in as User B and try to read/update User A’s data.

### Run

From the project root:

```bash
npx tsx scripts/test-rls.mts
```

The script will:

- Sign in as User A and record their user id (and optionally fetch a booking id).
- Sign in as User B.
- For `bookings`, `memberships`, `profiles`, and `check_ins`:
  - **SELECT** rows where `user_id` (or `id` for profiles) equals User A’s id and assert no rows returned.
  - **UPDATE** (where applicable) and assert no row updated.
- Print success or failure for each check.

### When to Run

- After adding or changing RLS policies.
- Before releases that touch auth or member data.
- Optionally in CI if you provide test users and env vars securely.

---

## Tables and Policies (Reference)

| Table         | Member access              | Admin access   |
|--------------|----------------------------|----------------|
| `profiles`   | Own row only (id = auth.uid()) | All SELECT/UPDATE |
| `memberships`| Own rows only (user_id = auth.uid()) | All SELECT/INSERT/UPDATE/DELETE |
| `bookings`   | Own rows only (user_id = auth.uid()) | All SELECT/INSERT/UPDATE/DELETE |
| `check_ins`  | Own rows only (user_id = auth.uid()) | All SELECT/INSERT/DELETE |

RLS is defined in `supabase/migrations/00001_initial_schema.sql` (and any later migrations that alter policies).
