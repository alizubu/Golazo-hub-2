'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function MagicCard({
  children,
  className = "",
  gradientSize = 200,
  gradientColor = "rgba(41, 193, 121, 0.15)", // Using pitch-bright color as default
}) {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative h-full w-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg transition-colors ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 100%)`,
        }}
      />
      <div className="relative h-full w-full z-10">{children}</div>
    </motion.div>
  );
}
