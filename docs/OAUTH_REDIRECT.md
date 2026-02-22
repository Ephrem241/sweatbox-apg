# OAuth (Google) login – 400 Bad Request fix

If you see a **400 Bad Request** when clicking "Continue with Google", Supabase is rejecting the redirect URL.

## Fix

Add your app’s auth callback URL to Supabase’s allow list:

1. Open **Supabase Dashboard** → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Under **Redirect URLs**, add the exact URL(s) you use:
   - Local: `http://localhost:3000/auth/callback`
   - LAN (e.g. phone/other device): `http://192.168.32.116:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
4. Save.

The URL must match the origin you use in the browser (e.g. if you open the app at `http://192.168.32.116:3000`, that origin’s `/auth/callback` must be in the list).

## Optional: use a single redirect origin

To always use one origin for OAuth (e.g. only localhost in dev), set in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Then open the app at that URL when testing Google login, and add only `http://localhost:3000/auth/callback` in Supabase Redirect URLs.
