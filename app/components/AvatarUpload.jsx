'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/app/components/UI';
import { Progress } from '@/app/components/ui/progress';
import { updatePlayerProfile } from '@/app/actions/player';

export default function AvatarUpload({ me, form, setForm, showToast }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    setUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 15;
      });
    }, 100);

    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) { height = Math.round((height *= MAX_WIDTH / width)); width = MAX_WIDTH; }
            } else {
              if (height > MAX_HEIGHT) { width = Math.round((width *= MAX_HEIGHT / height)); height = MAX_HEIGHT; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
      });

      clearInterval(interval);
      setProgress(100);
      setSuccess(true);
      
      const updateRes = await updatePlayerProfile(me.id, { avatarImage: base64String });
      if (updateRes.error) throw new Error(updateRes.error);
      
      setForm(prev => ({ ...prev, avatarImage: base64String }));
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      clearInterval(interval);
      setSuccess(false);
      console.error(err);
      if (showToast) showToast(err.message || 'Upload failed');
      else if (typeof window !== 'undefined') alert(err.message || 'Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 500);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  // Cleanup object urls to avoid memory leaks
  useEffect(() => {
    return () => {
      if (form.avatarImage && form.avatarImage.startsWith('blob:')) {
        URL.revokeObjectURL(form.avatarImage);
      }
    };
  }, [form.avatarImage]);

  return (
    <div 
      className="relative group/avatar"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div 
        className={`rounded-full p-1.5 shrink-0 shadow-xl inline-block relative cursor-pointer transition-colors duration-300 ${isDragging ? 'bg-pitch border-2 border-dashed border-pitch-bright' : 'bg-card'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar p={{ ...me, avatar: form.avatar, avatarImage: form.avatarImage }} size={120} ring="var(--gold)" />
        
        {/* Hover Overlay */}
        <AnimatePresence>
          {(isHovered || isDragging) && !uploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-1.5 rounded-full bg-black/60 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm"
            >
              <Camera size={28} className="mb-1" />
              <span className="text-[10px] font-semibold tracking-wider uppercase">Change</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Uploading State */}
        <AnimatePresence>
          {uploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-1.5 rounded-full bg-black/80 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm px-4"
            >
              <Progress value={progress} className="h-1.5 w-full bg-secondary" />
              <span className="text-[10px] font-semibold mt-2">{progress}%</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Burst */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-1.5 rounded-full bg-green-500/90 flex flex-col items-center justify-center text-white z-20 backdrop-blur-md"
            >
              <CheckCircle2 size={40} className="text-white drop-shadow-md" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {/* Online Status Badge (Magic UI Ping effect added later) */}
        <div className="absolute bottom-4 right-4 z-30">
          <div className="relative flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-4 border-card" title="Online"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
