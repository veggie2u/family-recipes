import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  hideText?: boolean;
}

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  hideText = false,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <PotHeartIcon className={cn("w-8 h-8", iconClassName)} />
      {!hideText && (
        <span
          className={cn(
            "font-display font-semibold text-xl tracking-tight",
            textClassName
          )}
        >
          Family Recipes
        </span>
      )}
    </div>
  );
}

export function PotHeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left handle */}
      <path
        d="M10 15C7.2 15 5.5 13.5 5.5 11.5C5.5 9.5 7.2 8 10 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right handle */}
      <path
        d="M22 15C24.8 15 26.5 13.5 26.5 11.5C26.5 9.5 24.8 8 22 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Pot body */}
      <path
        d="M9 15H23L21 26Q20.5 27 19.5 27H12.5Q11.5 27 11 26Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Rim */}
      <line
        x1="8"
        y1="15"
        x2="24"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Heart inside pot */}
      <path
        d="M16 24L12.5 20.5C11.4 19.4 11.4 17.6 12.5 16.5C13.3 15.7 14.4 15.6 15.3 16.2L16 16.8L16.7 16.2C17.6 15.6 18.7 15.7 19.5 16.5C20.6 17.6 20.6 19.4 19.5 20.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
