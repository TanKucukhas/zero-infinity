"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const router = useRouter();
  const { user, isReady } = useUser();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    if (!isReady) return;

    // If user is logged in, go to contacts
    // If not logged in, go to login
    if (user) {
      window.location.href = "/contacts";
    } else {
      window.location.href = "/login";
    }
  }, [user, isReady])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
        <p className="text-zinc-600 dark:text-zinc-400">{!isReady ? "Loading..." : (user ? "Redirecting to contacts..." : "Redirecting to login...")}</p>
      </div>
    </div>
  );
}