import { AppNav } from "@/components/app-nav";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";

export default function PublicLayout({
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

      <SiteFooter />
      <Toaster position="top-right" />
    </main>
  );
}
