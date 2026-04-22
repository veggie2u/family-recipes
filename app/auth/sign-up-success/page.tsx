import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Page() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <nav className="w-full border-b border-border px-6 py-4 flex justify-between items-center">
        <BrandLogo />
        <ThemeSwitcher />
      </nav>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">
                  Check your email
                </CardTitle>
                <CardDescription>Confirm your account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve successfully signed up. Please check your email to
                  confirm your account before signing in.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
