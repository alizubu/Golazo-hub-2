import { Flame } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Flame className="text-pitch-bright w-12 h-12 opacity-50" />
      </div>
      <h1 className="font-heading font-black text-3xl mb-3">You&apos;re Offline</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        It looks like you&apos;ve lost connection. Don&apos;t worry, some data might still be available in the app.
      </p>
      <Link href="/" className="px-6 py-3 bg-pitch-bright text-black font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity">
        Try Again
      </Link>
    </div>
  );
}
