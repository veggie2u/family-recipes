import Link from "next/link";
import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { AuthButton } from "@/components/auth-button";

const NAV_LINKS = [
  { label: "Feed", href: "/feed" },
  { label: "Recipes", href: "/recipes" },
  { label: "Cookbooks", href: "/cookbooks" },
  { label: "Families", href: "/families" },
];

export function AppNav() {
  return (
    <nav className="w-full border-b border-border">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-8">
          <BrandLogo href="/feed" />
          <div className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
