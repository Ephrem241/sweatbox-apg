"use client";

import dynamic from "next/dynamic";

const QRCode = dynamic(
  () => import("react-qr-code").then((mod) => ({ default: mod.default })),
  { ssr: false }
);

type Props = { value: string; size?: number };

export function CheckInQR({ value, size = 200 }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-white/95">
      <QRCode value={value} size={size} />
    </div>
  );
}
