"use client";
import AppThemeProvider from "@/contexts/theme-context";
import { UserProvider } from "@/contexts/user-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </AppThemeProvider>
  );
}