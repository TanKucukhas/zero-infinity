'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Illustrations from '@components/Illustrations';

type Mode = 'light' | 'dark';

const NotFound = ({ mode }: { mode: Mode }) => {
  const darkImg = '/images/pages/misc-mask-dark.png';
  const lightImg = '/images/pages/misc-mask-light.png';
  const miscBackground = mode === 'dark' ? darkImg : lightImg;

  return (
    <div className="flex items-center justify-center min-h-[100dvh] relative p-6 overflow-x-hidden">
      <div className="flex items-center flex-col text-center gap-10">
        <div className="flex flex-col gap-2 w-[90vw] sm:w-auto">
          <h1 className="font-medium text-8xl text-zinc-900 dark:text-zinc-100">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Page Not Found ⚠️</h2>
          <p className="text-zinc-600 dark:text-zinc-400">We couldn't find the page you are looking for.</p>
        </div>
        <img
          alt="error-illustration"
          src="/images/illustrations/characters/5.png"
          className="object-cover h-[400px] md:h-[450px] lg:h-[500px]"
        />
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
      <Illustrations maskImg={{ src: miscBackground }} />
    </div>
  );
};

export default NotFound;