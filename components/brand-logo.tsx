import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  hideText?: boolean;
  href?: string;
}

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  hideText = false,
  href = "/",
}: BrandLogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/icon-transparent.png"
        alt="Family Recipes logo"
        width={53}
        height={48}
        className={cn("h-12 w-auto object-contain", iconClassName)}
      />
      {!hideText && (
        <span
          className={cn(
            "font-display font-semibold text-xl tracking-tight leading-none",
            textClassName
          )}
        >
          Family Recipes
        </span>
      )}
    </Link>
  );
}
