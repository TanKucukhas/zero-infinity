"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Settings, UserCog } from "lucide-react";
import classNames from "classnames";
import { useUser } from "@/contexts/user-context";

const menuItems = [
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Create menu items based on user role
  const adminMenuItems = [...menuItems];
  if (user && user.role === 'admin') {
    adminMenuItems.splice(1, 0, { href: "/users", label: "Users", icon: UserCog });
  }

  return (
    <nav className="space-y-1">
      {adminMenuItems.map(item => {
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
