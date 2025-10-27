"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Moon, Sun, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/");
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
          <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
            People enrichment and management platform
          </div>
        </div>

        {/* Invite Only Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Lock className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">Invite Only Platform</h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Registration is currently by invitation only. Contact your administrator for access.
              </p>
            </div>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-center">Request Invite</h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400 text-center">
          Request an invitation to join our platform
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            placeholder="Enter your full name" 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            placeholder="Enter your email" 
            required 
          />
          
          <div className="relative">
            <Input 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-600" required />
            <label className="text-sm text-zinc-700 dark:text-zinc-300">
              I agree to the{" "}
              <Link href="/terms" className="text-brand-600 hover:underline">
                Terms of Service
              </Link>
            </label>
          </div>

          <Button type="submit" className="w-full">
            Request Invite
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}