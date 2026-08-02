'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Btn, MagicCard } from '@/app/components/UI';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06080F] flex items-center justify-center p-4">
      <MagicCard className="w-full max-w-md p-10 flex flex-col items-center text-center">
        <h1 className="text-8xl font-black text-amber-500 font-heading mb-4 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2 font-heading">Page Not Found</h2>
        <p className="text-zinc-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link href="/">
          <Btn className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Btn>
        </Link>
      </MagicCard>
    </div>
  );
}
