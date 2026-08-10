"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    isInView &&
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(() => {
    const handleUpdate = (latest) => {
      if (ref.current) {
        const num = Number(latest);
        ref.current.textContent = Intl.NumberFormat("en-US").format(
          isNaN(num) ? 0 : Math.round(num)
        );
      }
    };

    const unsubscribe = springValue.on("change", handleUpdate);
    
    // Set initial value immediately to prevent blank rendering
    handleUpdate(springValue.get());

    return () => unsubscribe();
  }, [springValue]);

  return (
    <span
      className={`inline-block tabular-nums tracking-wider ${className}`}
      ref={ref}
    />
  );
}
