'use client';

import type { CSSProperties } from 'react';

type LogoTextProps = {
  color?: CSSProperties['color'];
};

const LogoText = ({ color }: LogoTextProps) => (
  <span 
    className="text-xl font-semibold tracking-wide uppercase ml-2"
    style={{ color: color || 'inherit' }}
  >
    Intel
  </span>
);

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  return (
    <div className="flex items-center min-h-[24px]">
      <img 
        src="/logo/z-logo.svg" 
        alt="ZeroInfinity Logo" 
        className="h-6 w-6"
      />
      <LogoText color={color} />
    </div>
  );
};

export default Logo;