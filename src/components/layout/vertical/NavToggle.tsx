'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavToggle = () => {
  const handleClick = () => {
    // Toggle sidebar logic will be implemented later
    console.log('Toggle sidebar');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleClick}
      className="lg:hidden text-zinc-700 dark:text-zinc-300"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

export default NavToggle;