"use client";

import { Link, usePathname } from "@/i18n/navigation";

const SECTIONS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/snack-items", label: "Snack items" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/memberships", label: "Memberships" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/snack-orders", label: "Snack orders" },
  { href: "/admin/trainers", label: "Trainers" },
  { href: "/admin/workout-videos", label: "Workout videos" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/check-ins", label: "Check-ins" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4"
      aria-label="Admin sections"
    >
      {SECTIONS.map(({ href, label }) => {
        const isActive =
          pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={
              isActive
                ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
