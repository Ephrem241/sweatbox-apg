"use client";

import { Instagram, Facebook, Twitter, Youtube, Music2 } from "lucide-react";

const SOCIAL_HANDLE = "sweatboxapg";
const SOCIAL_LINKS = [
  { href: `https://instagram.com/${SOCIAL_HANDLE}`, Icon: Instagram, label: "Instagram" },
  { href: `https://facebook.com/${SOCIAL_HANDLE}`, Icon: Facebook, label: "Facebook" },
  { href: `https://twitter.com/${SOCIAL_HANDLE}`, Icon: Twitter, label: "Twitter" },
  { href: `https://youtube.com/@${SOCIAL_HANDLE}`, Icon: Youtube, label: "YouTube" },
  { href: `https://tiktok.com/@${SOCIAL_HANDLE}`, Icon: Music2, label: "TikTok" },
] as const;

type SocialLinksProps = {
  showHandle?: boolean;
  className?: string;
};

export function SocialLinks({ showHandle = true, className }: SocialLinksProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {SOCIAL_LINKS.map(({ href, Icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={label}
          >
            <Icon className="size-5" aria-hidden />
          </a>
        ))}
        {showHandle && (
          <span className="ml-0.5 text-sm text-muted-foreground">@{SOCIAL_HANDLE}</span>
        )}
      </div>
    </div>
  );
}
