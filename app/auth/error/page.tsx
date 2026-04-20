import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          Code error: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <nav className="w-full border-b border-border px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <BrandLogo />
        </Link>
        <ThemeSwitcher />
      </nav>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense>
                  <ErrorContent searchParams={searchParams} />
                </Suspense>
                <div className="mt-4 text-center text-sm">
                  <Link href="/" className="underline underline-offset-4">
                    Back to home
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
