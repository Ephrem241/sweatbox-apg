import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  children,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-display text-2xl font-bold tracking-tight md:text-3xl",
        className
      )}
    >
      {children}
    </Tag>
  );
}
