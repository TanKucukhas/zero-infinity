"use client";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/contexts/user-context";
import { Moon, Sun, Menu, LogOut, Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useUser();

  return (
    <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Left side - Menu button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            ZeroInfinity Intel
          </h1>
        </div>
      </div>
      
      {/* Right side - User info and actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs"></span>
        </Button>

        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="text-right">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                  <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200 rounded-full text-xs font-medium">
                  {user.role}
                </span>
              </div>
            </div>
            
            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
            
            {/* Logout */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
