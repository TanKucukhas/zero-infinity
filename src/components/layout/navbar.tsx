"use client";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/contexts/user-context";
import { Moon, Sun, LogOut, Settings, User, Users, Search, Bell, UserCog, Shield, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DbBadge from "@/components/ui/DbBadge";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const menuItems = [
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/companies", label: "Companies", icon: Building2 },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/contacts?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  return (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur-sm">
      {/* Left side - Logo and Navigation */}
      <div className="flex items-center gap-6">
        <Link href="/contacts" className="flex items-center gap-2">
          {/* Logo SVG */}
          <img src="/logo/z-logo.svg" alt="Logo" className="h-8 w-auto" />
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Intel
          </h1>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center - Global Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <form onSubmit={handleGlobalSearch} className="w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search people, companies, emails..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
          />
        </form>
      </div>
      
      {/* Right side - Theme, Notifications, User menu */}
      <div className="flex items-center gap-2">
        {/* Database Badge */}
        <DbBadge />

        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {user.name || "User"}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user.role || "viewer"}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                </div>
                
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                
                {/* Admin Section - Only show for admin users */}
                {user && user.role === 'admin' && (
                  <>
                    <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        <Shield className="h-3 w-3" />
                        Admin
                      </div>
                    </div>
                    
                    <Link
                      href="/users"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <UserCog className="h-4 w-4" />
                      Manage Users
                    </Link>
                  </>
                )}
                
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
        )}
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}

