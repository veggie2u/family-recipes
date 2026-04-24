import { AppNav } from "@/components/app-nav";
import { Toaster } from "@/components/ui/sonner";

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppNav />

      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {children}
      </div>

      <footer className="bg-muted py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Family Recipes. All rights reserved.</p>
        </div>
      </footer>
      <Toaster position="top-right" />
    </main>
  );
}
