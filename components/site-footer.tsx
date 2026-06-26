import pkg from "@/package.json";

export function SiteFooter() {
  return (
    <footer className="bg-muted py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© 2026 Family Recipes. All rights reserved.</p>
        <p>v{pkg.version}</p>
      </div>
    </footer>
  );
}
