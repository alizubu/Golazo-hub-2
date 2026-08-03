'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -15 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full h-full min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
