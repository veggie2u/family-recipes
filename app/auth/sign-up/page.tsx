import { SignUpForm } from "@/components/sign-up-form";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Page() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      {/* Minimal nav */}
      <nav className="w-full border-b border-border px-6 py-4 flex justify-between items-center">
        <BrandLogo />
        <ThemeSwitcher />
      </nav>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm flex flex-col gap-4">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
