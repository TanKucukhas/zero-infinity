'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavSearch = () => {
  return (
    <div className="flex items-center cursor-pointer gap-2">
      <Button variant="ghost" size="sm" className="text-zinc-700 dark:text-zinc-300">
        <Search className="h-5 w-5" />
      </Button>
      <div className="whitespace-nowrap select-none text-zinc-500 dark:text-zinc-400">Search ⌘K</div>
    </div>
  );
};

export default NavSearch;