'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Check, Pencil, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { updatePlayerProfile } from '@/app/actions/player';
import AvatarUpload from '@/app/components/shared/AvatarUpload';

export default function ProfileIdCard({ me, form, setForm, showToast }) {
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverFailedUrl, setCoverFailedUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  // Inline editing state
  const [editingField, setEditingField] = useState(null); // 'name' | 'bio' | null
  const [tempValue, setTempValue] = useState('');

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverUploading(true);
      setCoverProgress(0);
      
      const interval = setInterval(() => {
        setCoverProgress(prev => (prev >= 90 ? 90 : prev + 15));
      }, 100);

      try {
        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
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
        setCoverProgress(100);
        
        const updateRes = await updatePlayerProfile(me.id, { coverBanner: base64String });
        if (updateRes.error) throw new Error(updateRes.error);
        
        setForm({ ...form, coverBanner: base64String });
      } catch (err) {
        clearInterval(interval);
        showToast(err.message || 'Cover upload failed');
      } finally {
        setTimeout(() => setCoverUploading(false), 500);
      }
    }
  };

  const startEdit = (field) => {
    setEditingField(field);
    setTempValue(form[field]);
  };

  const saveEdit = () => {
    if (editingField === 'bio' && tempValue.length > 150) {
        showToast("Bio must be 150 characters or less");
        return;
    }
    setForm({ ...form, [editingField]: tempValue });
    setEditingField(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && editingField !== 'bio') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005, rotateY: 1, rotateX: -1 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-card/80 border border-border/50 shadow-2xl backdrop-blur-xl group"
    >
      {/* Cover Banner */}
      <div className="relative h-40 sm:h-56 w-full bg-secondary/30 overflow-hidden">
        {form.coverBanner && coverFailedUrl !== form.coverBanner ? (
          <img src={form.coverBanner} alt="Cover Banner" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" onError={() => setCoverFailedUrl(form.coverBanner)} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-secondary to-background">
            <span className="text-sm font-semibold opacity-30 tracking-widest uppercase">No Cover Set</span>
          </div>
        )}

        {/* Cover Upload Overlay */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center z-10 backdrop-blur-[2px]"
        >
          {coverUploading ? (
            <div className="w-1/2 flex flex-col items-center gap-2">
              <Progress value={coverProgress} className="h-1.5 w-full bg-secondary" />
              <span className="text-[11px] font-bold text-white tracking-widest">{coverProgress}%</span>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                <Camera className="text-white drop-shadow-md" size={24} />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-widest drop-shadow-md">Change Banner</span>
            </motion.div>
          )}
        </div>
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleCoverUpload} />
        
        {/* Shadow Gradient at bottom of cover */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* Profile Content */}
      <div className="relative px-6 sm:px-8 pb-8">
        {/* Avatar positioned over the cover border */}
        <div className="relative -mt-16 sm:-mt-20 mb-6 flex justify-between items-end">
          <div className="relative z-20 pl-2">
             <AvatarUpload me={me} form={form} setForm={setForm} showToast={showToast} size={140} />
          </div>
          
          <div className="hidden sm:block pb-4">
             <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
               <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Player ID</p>
               <p className="text-xs text-white/90 font-mono">#{me.id.substring(0,8).toUpperCase()}</p>
             </div>
          </div>
        </div>

        {/* Text Details with Inline Editing */}
        <div className="space-y-6">
          <div className="space-y-1">
            {/* Display Name */}
            {editingField === 'name' ? (
              <div className="relative flex items-center">
                <Input 
                  autoFocus 
                  value={tempValue} 
                  onChange={e => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  className="h-10 text-2xl sm:text-3xl font-black bg-background border-pitch-bright/50 pr-10 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                />
                <button onClick={saveEdit} className="absolute right-2 text-pitch-bright hover:text-white p-1 bg-background rounded-md"><Check size={18}/></button>
              </div>
            ) : (
              <h2 
                onClick={() => startEdit('name')}
                className="text-2xl sm:text-3xl font-black text-foreground group/name cursor-pointer flex items-center gap-2 hover:text-pitch-bright transition-colors w-fit"
                title="Click to edit"
              >
                {form.name || "Set your name"}
                <Pencil size={14} className="opacity-0 group-hover/name:opacity-100 transition-opacity text-muted-foreground" />
              </h2>
            )}
            
            {/* Username */}
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm group/uname" title="Username cannot be changed">
              <span>@{me.username}</span>
              <AlertCircle size={12} className="opacity-50" />
            </div>
          </div>

          <div className="w-full h-px bg-border/40" />

          {/* Bio */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex justify-between">
              Bio 
              {editingField === 'bio' && <span className={tempValue.length > 150 ? "text-destructive" : ""}>{tempValue.length}/150</span>}
            </p>
            {editingField === 'bio' ? (
              <div className="relative">
                <Textarea 
                  autoFocus 
                  value={tempValue} 
                  onChange={e => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[100px] text-sm bg-background border-pitch-bright/50 shadow-[0_0_15px_rgba(56,189,248,0.2)] resize-none"
                />
                <div className="flex justify-end mt-2 gap-2">
                  <button onMouseDown={() => setEditingField(null)} className="px-3 py-1 text-xs font-semibold rounded-md hover:bg-secondary">Cancel</button>
                  <button onMouseDown={saveEdit} className="px-3 py-1 text-xs font-semibold rounded-md bg-pitch-bright text-pitch-bright-foreground hover:bg-sky-400">Save Bio</button>
                </div>
              </div>
            ) : (
              <p 
                onClick={() => startEdit('bio')}
                className={`text-sm leading-relaxed cursor-pointer group/bio hover:bg-secondary/20 p-2 -mx-2 rounded-lg transition-colors ${!form.bio ? 'text-muted-foreground italic' : 'text-foreground/90'}`}
                title="Click to edit"
              >
                {form.bio || "Write something about your playstyle..."}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
