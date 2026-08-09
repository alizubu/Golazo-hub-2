import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function ClubLogo({ club, size = 40, className = "" }) {
  const [error, setError] = useState(false);

  if (!club) return null;

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative flex-shrink-0 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {!error && club.crestPath ? (
        <Image 
          src={club.crestPath} 
          alt={club.name} 
          width={size} 
          height={size} 
          className="w-full h-full object-contain drop-shadow-sm"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-pitch font-bold text-white rounded-full overflow-hidden" style={{ fontSize: Math.max(10, size * 0.4) }}>
          {club.name ? club.name.charAt(0).toUpperCase() : 'FC'}
        </div>
      )}
    </motion.div>
  );
}
