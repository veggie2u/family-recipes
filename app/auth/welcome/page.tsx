import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <nav className="w-full bg-background px-6 py-4 flex justify-between items-center">
        <BrandLogo />
        <ThemeSwitcher />
      </nav>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">
                  Email confirmed!
                </CardTitle>
                <CardDescription>Welcome to Family Recipes</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Your account is all set. Start exploring recipes or add your
                  own to preserve your family&apos;s culinary heritage.
                </p>
                <Button asChild>
                  <Link href="/feed">Go to Feed</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
