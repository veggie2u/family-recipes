import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";

export default function CookbooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <nav className="w-full border-b border-border">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
          <BrandLogo />
          <div className="flex items-center gap-5">
            <Suspense>
              <AuthButton />
            </Suspense>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {children}
      </div>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <BrandLogo
            iconClassName="h-5 w-auto"
            textClassName="text-sm font-medium"
          />
          <p>© 2024 Family Recipes. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
