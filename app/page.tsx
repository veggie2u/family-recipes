import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { BookOpen, Heart, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const features = [
  {
    icon: BookOpen,
    title: "Preserve Heritage",
    description:
      "Capture beloved recipes exactly as grandma made them — ingredients, stories, and all.",
  },
  {
    icon: Users,
    title: "Organize Together",
    description:
      "Gather your family into one place to build and grow your shared cookbook collection.",
  },
  {
    icon: Heart,
    title: "Share & Celebrate",
    description:
      "Pass traditions forward. Share recipes publicly or keep them close to family only.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="w-full border-b border-border">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <Suspense>
              <AuthButton />
            </Suspense>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-28">
        <div className="max-w-2xl flex flex-col items-center gap-6">
          {/* Decorative icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 text-accent mb-2">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="w-11 h-11"
              aria-hidden="true"
            >
              <path
                d="M10 15C7.2 15 5.5 13.5 5.5 11.5C5.5 9.5 7.2 8 10 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M22 15C24.8 15 26.5 13.5 26.5 11.5C26.5 9.5 24.8 8 22 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9 15H23L21 26Q20.5 27 19.5 27H12.5Q11.5 27 11 26Z"
                fill="currentColor"
                fillOpacity="0.15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line
                x1="8"
                y1="15"
                x2="24"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16 24L12.5 20.5C11.4 19.4 11.4 17.6 12.5 16.5C13.3 15.7 14.4 15.6 15.3 16.2L16 16.8L16.7 16.2C17.6 15.6 18.7 15.7 19.5 16.5C20.6 17.6 20.6 19.4 19.5 20.5Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Your Family&apos;s Culinary Heritage
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            Preserve, organize, and share the recipes that bring your family
            together — passed down through generations.
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 my-2 text-accent/50">
            <div className="h-px w-16 bg-accent/30" />
            <span className="text-xs tracking-widest uppercase font-medium text-accent/60">
              ✦ est. in your kitchen ✦
            </span>
            <div className="h-px w-16 bg-accent/30" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Get Started — It&apos;s Free
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <BrandLogo
            iconClassName="w-5 h-5"
            textClassName="text-sm font-medium"
          />
          <p>© 2024 Family Recipes. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

