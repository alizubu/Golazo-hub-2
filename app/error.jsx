'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Btn, MagicCard } from '@/app/components/shared/UI';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#06080F] flex items-center justify-center p-4">
      <MagicCard className="w-full max-w-lg p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-heading">Something went wrong!</h2>
        <p className="text-zinc-400 mb-6">
          We've encountered an unexpected error. The technical details have been logged.
        </p>
        
        <div className="bg-black/50 border border-red-500/20 rounded-lg p-4 w-full text-left overflow-x-auto mb-8">
          <p className="text-red-400 font-mono text-sm mb-2 font-semibold">Digest: {error.digest || 'N/A'}</p>
          <p className="text-zinc-300 font-mono text-xs">{error.message}</p>
        </div>

        <Btn 
          onClick={() => reset()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </Btn>
      </MagicCard>
    </div>
  );
}
