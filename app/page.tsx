import { AppNav } from "@/components/app-nav";
import { BrandLogo } from "@/components/brand-logo";
import { BookOpen, Heart, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
      {/* Hero — full viewport, nav floats inside */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 md:py-28">
        {/* Floating nav — pure glassmorphism, no border, no bg fill */}
        <AppNav className="absolute top-0 left-0 right-0 z-20 border-b-0 bg-transparent backdrop-blur-[16px]" />

        {/* Framing images — decorative, cropped at edges, lg+ only */}
        <div className="pointer-events-none hidden lg:block absolute left-0 top-0 -translate-x-16 -translate-y-8">
          <Image
            src="/books.png"
            alt=""
            width={840}
            height={865}
            priority
            className="w-96 h-auto rounded-xl opacity-90"
          />
        </div>
        <div className="pointer-events-none hidden lg:block absolute right-0 top-1/4 -translate-y-16 translate-x-14">
          <Image
            src="/RecipeCard.png"
            alt=""
            width={911}
            height={1012}
            className="w-72 h-auto rounded-xl opacity-90"
          />
        </div>
        <div className="pointer-events-none hidden lg:block absolute left-0 bottom-0 -translate-x-10">
          <Image
            src="/coffee.png"
            alt=""
            width={792}
            height={793}
            className="w-64 h-auto rounded-xl opacity-90"
          />
        </div>

        <div className="relative z-10 max-w-2xl flex flex-col items-center gap-6">
          {/* Decorative icon */}
          <div className="mb-2">
            <Image
              src="/logo.png"
              alt="Family Recipes"
              width={188}
              height={200}
              className="h-48 w-auto object-contain"
            />
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
              href="/feed"
              className="inline-flex items-center justify-center px-6 py-3 rounded border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Browse Recipes
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
      <section className="bg-card py-16 px-6">
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
      <footer className="bg-background py-8 px-6">
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

