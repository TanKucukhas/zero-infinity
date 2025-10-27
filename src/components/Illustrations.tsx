'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';

type IllustrationsProps = {
  maskImg?: { src: string };
  className?: string;
  children?: ReactNode;
};

const Illustrations = forwardRef<HTMLDivElement, IllustrationsProps>((props, ref) => {
  const { maskImg, className, children, ...other } = props;

  return (
    <div ref={ref} className={className} {...other}>
      {maskImg && (
        <img
          src={maskImg.src}
          alt="illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {children}
    </div>
  );
});

Illustrations.displayName = 'Illustrations';

export default Illustrations;