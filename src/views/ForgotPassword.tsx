"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";

export default function ForgotPassword() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-zinc-700 dark:text-zinc-300"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo/z-logo.svg" 
              alt="ZeroInfinity Logo" 
              className="h-12 w-12"
            />
          </div>
          <div className="text-2xl font-bold text-brand-600 mb-1">ZeroInfinity Intel</div>
        </div>

        <div className="mb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 text-center">
            Enter your email address and we'll send you a reset link
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            placeholder="Enter your email"
            helperText="We'll send a password reset link to this email"
            required
          />

          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Remember your password?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}