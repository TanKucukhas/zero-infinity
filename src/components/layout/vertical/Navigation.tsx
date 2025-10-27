'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import VerticalMenu from './VerticalMenu';
import Logo from '@components/layout/shared/Logo';

const Navigation = () => {
  const shadowRef = useRef<HTMLDivElement>(null);

  const scrollMenu = (container: any) => {
    if (shadowRef.current && container.scrollTop > 0) {
      if (!shadowRef.current.classList.contains('scrolled')) {
        shadowRef.current.classList.add('scrolled');
      }
    } else if (shadowRef.current) {
      shadowRef.current.classList.remove('scrolled');
    }
  };

  return (
    <div className="h-full overflow-y-auto border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Nav Header including Logo & nav toggle icons */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <button className="lg:hidden text-zinc-700 dark:text-zinc-300">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div 
        ref={shadowRef}
        className="absolute top-15 left-0 z-10 h-16 w-full opacity-0 transition-opacity duration-150 ease-in-out pointer-events-none bg-gradient-to-b from-white via-white/85 to-transparent dark:from-zinc-900 dark:via-zinc-900/85"
      />
      
      <VerticalMenu scrollMenu={scrollMenu} />
    </div>
  );
};

export default Navigation;