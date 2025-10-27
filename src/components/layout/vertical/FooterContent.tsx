'use client';

import Link from 'next/link';

const FooterContent = () => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <span>{`© ${new Date().getFullYear()}, Made with `}</span>
        <span>{`❤️`}</span>
        <span>{` by `}</span>
        <Link href='https://themeselection.com' target='_blank' className='text-brand-600 hover:underline'>
          ThemeSelection
        </Link>
      </p>
      <div className='flex items-center gap-4'>
        <Link href='https://themeselection.com/license' target='_blank' className='text-brand-600 hover:underline text-sm'>
          License
        </Link>
        <Link href='https://themeselection.com' target='_blank' className='text-brand-600 hover:underline text-sm'>
          More Themes
        </Link>
        <Link href={process.env.NEXT_PUBLIC_DOCS_URL as string} target='_blank' className='text-brand-600 hover:underline text-sm'>
          Documentation
        </Link>
        <Link
          href={`https://github.com/themeselection/${process.env.NEXT_PUBLIC_REPO_NAME}/issues`}
          target='_blank'
          className='text-brand-600 hover:underline text-sm'
        >
          Support
        </Link>
      </div>
    </div>
  );
};

export default FooterContent;