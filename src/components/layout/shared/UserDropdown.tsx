'use client';

import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, DollarSign, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleDropdownOpen = () => {
    setOpen(!open);
  };

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url);
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <div className="relative">
      <div 
        ref={anchorRef}
        onClick={handleDropdownOpen}
        className="relative cursor-pointer"
      >
        <img
          src="/images/avatars/1.png"
          alt="John Doe"
          className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
        />
        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
      </div>
      
      {open && (
        <div className="absolute right-0 top-12 z-50 min-w-[240px] rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="p-4">
            <div className="flex items-center gap-3 pb-2">
              <img src="/images/avatars/1.png" alt="John Doe" className="h-10 w-10 rounded-full" />
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">John Doe</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Admin</p>
              </div>
            </div>
            
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2">
              <button 
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => handleDropdownClose()}
              >
                <User className="h-4 w-4" />
                My Profile
              </button>
              <button 
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => handleDropdownClose()}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button 
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => handleDropdownClose()}
              >
                <DollarSign className="h-4 w-4" />
                Pricing
              </button>
              <button 
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => handleDropdownClose()}
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </button>
            </div>
            
            <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDropdownClose(undefined, '/login')}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;