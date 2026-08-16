'use client';

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const FlickeringGrid = ({
  className,
  gridSize = 24,
  color = "#ffffff",
  flickerSpeed = 0.5,
  maxOpacity = 0.15,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let grid = [];
    let animationFrameId;

    // Convert hex color to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 255, g: 255, b: 255 };
    };

    const rgb = hexToRgb(color);

    const init = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      // Adjust for high DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      cols = Math.ceil(width / gridSize);
      rows = Math.ceil(height / gridSize);

      grid = new Float32Array(cols * rows);
      for (let i = 0; i < grid.length; i++) {
        grid[i] = Math.random();
      }
    };

    init();

    const resizeObserver = new ResizeObserver(() => {
      init();
    });
    resizeObserver.observe(canvas);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < grid.length; i++) {
        if (Math.random() < 0.1 * flickerSpeed) {
          grid[i] = Math.random();
        }

        const x = (i % cols) * gridSize;
        const y = Math.floor(i / cols) * gridSize;

        const currentOpacity = grid[i] * maxOpacity;
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentOpacity})`;
        // Subtract 1 from gridSize for the gap between squares
        ctx.fillRect(x, y, gridSize - 1, gridSize - 1);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [gridSize, color, flickerSpeed, maxOpacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
};
