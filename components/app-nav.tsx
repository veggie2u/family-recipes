import Link from "next/link";
import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { AuthButton } from "@/components/auth-button";
import { BetaBanner } from "@/components/beta-banner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

const PUBLIC_NAV_LINKS = [
  { label: "Feed", href: "/feed" },
  { label: "Recipes", href: "/recipes" },
  { label: "Families", href: "/families" },
];

const AUTH_NAV_LINKS = [
  { label: "Cookbooks", href: "/cookbooks" },
];

async function AuthNavLinks() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) return null;

  return (
    <>
      {AUTH_NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

export function AppNav({ className }: { className?: string }) {
  return (
    <div className="sticky top-0 z-10">
      <Suspense>
        <BetaBanner />
      </Suspense>
      <nav className={cn("w-full bg-card shadow-sm", className)}>
        <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-8">
            <BrandLogo href="/feed" />
            <div className="hidden sm:flex items-center gap-6">
              {PUBLIC_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Suspense>
                <AuthNavLinks />
              </Suspense>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  );
}
