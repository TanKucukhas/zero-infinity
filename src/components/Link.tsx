'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { ReactNode } from 'react';

type CustomLinkProps = LinkProps & {
  className?: string;
  children?: ReactNode;
};

const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>((props, ref) => {
  const { href, className, children, ...other } = props;

  return (
    <Link ref={ref} href={href} className={className} {...other}>
      {children}
    </Link>
  );
});

CustomLink.displayName = 'CustomLink';

export default CustomLink;