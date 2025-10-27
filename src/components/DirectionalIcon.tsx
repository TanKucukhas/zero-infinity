'use client';

import { forwardRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DirectionalIconProps = {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
};

const DirectionalIcon = forwardRef<HTMLButtonElement, DirectionalIconProps>((props, ref) => {
  const { className, onClick, children, ...other } = props;

  return (
    <button 
      ref={ref} 
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 ${className || ''}`}
      onClick={onClick} 
      {...other}
    >
      {children || <ArrowLeft className="h-5 w-5" />}
    </button>
  );
});

DirectionalIcon.displayName = 'DirectionalIcon';

export default DirectionalIcon;