"use client";
import AppThemeProvider from "@/contexts/theme-context";
import { UserProvider } from "@/contexts/user-context";
import { NotificationProvider } from "@/contexts/notification-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <UserProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </UserProvider>
    </AppThemeProvider>
  );
}