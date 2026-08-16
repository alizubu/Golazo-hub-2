'use client';

import React from "react";
import { cn } from "@/lib/utils";

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className,
      )}
    >
      <style>{`
        @keyframes ripple {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(0.9); }
        }
        .animate-ripple {
          animation: ripple 3s ease infinite;
        }
      `}</style>
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(0, mainCircleOpacity - i * 0.05);
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = Math.min(100, 15 + i * 15);

        return (
          <div
            key={i}
            className={`absolute animate-ripple rounded-full border bg-white/10 shadow-xl`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle,
              borderWidth: "1px",
              borderColor: `rgba(255, 255, 255, ${borderOpacity / 100})`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
            }}
          />
        );
      })}
    </div>
  );
});
