/**
 * Single source of truth for main navigation links (header and footer).
 */
export const navLinks = [
  { href: "/", labelKey: "home" as const },
  { href: "/about", labelKey: "about" as const },
  { href: "/classes", labelKey: "classes" as const },
  { href: "/pricing", labelKey: "memberships" as const },
  { href: "/locations", labelKey: "locations" as const },
  { href: "/trainers", labelKey: "trainers" as const },
  { href: "/blog", labelKey: "blog" as const },
  { href: "/contact", labelKey: "contact" as const },
  { href: "/schedule", labelKey: "schedule" as const },
  { href: "/shop", labelKey: "shop" as const },
  { href: "/library", labelKey: "library" as const },
  { href: "/snack-bar", labelKey: "snackBar" as const },
  { href: "/gallery", labelKey: "gallery" as const },
] as const;

/** Nav links grouped into four dropdowns for the navbar. */
export const navGroups = [
  {
    labelKey: "discover" as const,
    links: [
      { href: "/", labelKey: "home" as const },
      { href: "/about", labelKey: "about" as const },
      { href: "/gallery", labelKey: "gallery" as const },
      { href: "/contact", labelKey: "contact" as const },
    ],
  },
  {
    labelKey: "training" as const,
    links: [
      { href: "/classes", labelKey: "classes" as const },
      { href: "/schedule", labelKey: "schedule" as const },
      { href: "/trainers", labelKey: "trainers" as const },
      { href: "/pricing", labelKey: "memberships" as const },
      { href: "/locations", labelKey: "locations" as const },
    ],
  },
  {
    labelKey: "services" as const,
    links: [
      { href: "/shop", labelKey: "shop" as const },
      { href: "/library", labelKey: "library" as const },
      { href: "/snack-bar", labelKey: "snackBar" as const },
    ],
  },
  {
    labelKey: "more" as const,
    links: [{ href: "/blog", labelKey: "blog" as const }],
  },
] as const;
