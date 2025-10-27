'use client';

import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ModeDropdown = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleToggle}
      className="text-zinc-700 dark:text-zinc-300"
      title={`${theme} Mode`}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

export default ModeDropdown;