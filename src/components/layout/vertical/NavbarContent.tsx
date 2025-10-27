import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavToggle from './NavToggle';
import NavSearch from '@components/layout/shared/search';
import ModeDropdown from '@components/layout/shared/ModeDropdown';
import UserDropdown from '@components/layout/shared/UserDropdown';

const NavbarContent = () => {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <NavToggle />
        <NavSearch />
      </div>
      <div className="flex items-center gap-2">
        <Link
          className="flex mr-2"
          href={`https://github.com/themeselection/${process.env.NEXT_PUBLIC_REPO_NAME}`}
          target="_blank"
        >
          <img
            height={24}
            alt="GitHub Repo stars"
            src={`https://img.shields.io/github/stars/themeselection/${process.env.NEXT_PUBLIC_REPO_NAME}`}
          />
        </Link>
        <ModeDropdown />
        <Button variant="ghost" size="sm" className="text-zinc-700 dark:text-zinc-300">
          <Bell className="h-5 w-5" />
        </Button>
        <UserDropdown />
      </div>
    </div>
  );
};

export default NavbarContent;