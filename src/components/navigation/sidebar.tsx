"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings, FileText } from "lucide-react";
import classNames from "classnames";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/people", label: "People", icon: Users },
  { href: "/import", label: "Import", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={classNames(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive 
                ? "bg-brand-600 text-white" 
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
