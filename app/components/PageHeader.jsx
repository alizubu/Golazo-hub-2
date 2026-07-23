import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';

export function PageHeader({ title, onBack }) {
  if (!onBack) return null; // Defensive check, should always be passed if used

  return (
    <>
      {/* Desktop view: ghost button top-left */}
      <div className="hidden md:flex items-center gap-3 mb-6">
        <motion.div whileTap={{ scale: 0.92 }}>
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full w-10 h-10 border border-border/50 hover:bg-secondary/80">
            <ChevronLeft size={20} />
          </Button>
        </motion.div>
        {title && <h2 className="text-xl font-bold font-display">{title}</h2>}
      </div>

      {/* Mobile view: sticky header bar */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-background/85 backdrop-blur-md border-b border-border p-3 flex items-center gap-3 mb-4 shadow-sm" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <motion.div whileTap={{ scale: 0.92 }}>
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full w-10 h-10 text-foreground hover:bg-secondary">
            <ChevronLeft size={24} />
          </Button>
        </motion.div>
        {title && <h1 className="text-lg font-bold font-display truncate flex-1">{title}</h1>}
      </div>
    </>
  );
}
