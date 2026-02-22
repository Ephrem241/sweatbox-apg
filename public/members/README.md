# Member & brand imagery

Place authentic photos of members and gym life here. The app reads image URLs from `lib/brand-images.ts`; replace those URLs with paths to files in this folder (e.g. `/members/hero-1.jpg`) or Supabase Storage.

**Suggested files:**

- **Hero (3):** `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg` — large, high-energy (recommended 1920×1080 or 1440×900).
- **Services (4):** `crossfit.jpg`, `combat.jpg`, `personal-training.jpg`, `youth.jpg` — for home page cards (recommended 800×600).
- **Gallery (6+):** `gallery-1.jpg`, … — for the gallery page (recommended 1200×800).

Update `lib/brand-images.ts` to point `src` at these paths (e.g. `/members/hero-1.jpg`).
