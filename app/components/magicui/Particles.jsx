'use client';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function Particles({
  className,
  quantity = 100,
  color = '#ffffff',
  vx = 0,
  vy = 0,
}) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const context = useRef(null);
  const circles = useRef([]);
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  const rafID = useRef(null);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const drawParticles = () => {
    circles.current = [];
    for (let i = 0; i < quantity; i++) {
      circles.current.push(circleParams());
    }
  };

  const circleParams = () => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + 0.1;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;
    return { x, y, translateX, translateY, size: pSize, alpha, targetAlpha, dx, dy, magnetism };
  };

  const hexToRgb = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };

  const drawCircle = (circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  };

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    }
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current = [];
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  const animate = () => {
    clearContext();
    circles.current.forEach((circle, i) => {
      // update properties
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      if (circle.alpha < circle.targetAlpha) {
        circle.alpha += 0.02;
      }
      
      // out of bounds logic
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current[i] = circleParams();
        circles.current[i].x = Math.random() * canvasSize.current.w;
        circles.current[i].y = Math.random() * canvasSize.current.h;
      }
      drawCircle(circle, true);
    });
    rafID.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext('2d');
    }
    initCanvas();
    animate();
    window.addEventListener('resize', initCanvas);
    
    return () => {
      window.removeEventListener('resize', initCanvas);
      if (rafID.current) cancelAnimationFrame(rafID.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  return (
    <div className={cn('pointer-events-none', className)} ref={canvasContainerRef} aria-hidden="true">
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
