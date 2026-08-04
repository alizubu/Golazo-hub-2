'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export function NavFab({ onClick }) {
  return (
    <Link 
      href="/dashboard"
      onClick={(e) => onClick(e, "/dashboard")}
      className="absolute left-1/2 -translate-x-1/2 top-[4px] w-[68px] h-[68px] rounded-full bg-gradient-to-b from-white to-[#E2E8F0] border-[5px] border-[#0A0D14] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex flex-col items-center justify-center gap-0.5 group z-20 outline-none hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-300 pointer-events-auto"
    >
      <motion.div 
        whileTap={{ scale: 0.92 }} 
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Home size={24} className="text-slate-900 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
      </motion.div>
      <span className="text-[9px] font-black text-slate-900 tracking-tight">Dashboard</span>
    </Link>
  );
}
