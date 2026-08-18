'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Send, Settings, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Info, Radio, Terminal } from 'lucide-react';
import { Card, SectionTitle, EmptyState, Btn, Input, Label, Badge } from '@/app/components/shared/UI';
import { getSystemSettings, updateSystemSettings, createCustomNotification, deleteCustomNotification, clearAllNotifications } from '@/app/actions/admin';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminNotifications({ notifications = [], showToast }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ autoNotificationsEnabled: true });
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ text: '', type: 'info' });

  useEffect(() => {
    async function loadSettings() {
      const res = await getSystemSettings();
      if (res.settings) {
        setSettings({ autoNotificationsEnabled: res.settings.autoNotificationsEnabled });
      }
    }
    loadSettings();
  }, []);

  const handleToggleAuto = async () => {
    setLoading(true);
    const newValue = !settings.autoNotificationsEnabled;
    const res = await updateSystemSettings({ autoNotificationsEnabled: newValue });
    if (res.error) {
      showToast(res.error);
    } else {
      setSettings({ autoNotificationsEnabled: newValue });
      showToast(`Automated notifications ${newValue ? 'enabled' : 'disabled'}`);
    }
    setLoading(false);
  };

  const handleSendCustom = async () => {
    if (!form.text.trim()) return showToast("Enter notification text");
    setLoading(true);
    const res = await createCustomNotification(form.text, form.type);
    if (res.error) {
      showToast(res.error);
    } else {
      showToast("Alert broadcasted!");
      setForm({ text: '', type: 'info' });
      supabase.channel('league-events').send({ type: 'broadcast', event: 'notification_refresh', payload: {} });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const res = await deleteCustomNotification(id);
    if (res.error) showToast(res.error);
    else showToast("Alert resolved");
    setLoading(false);
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to resolve ALL system alerts?")) return;
    setLoading(true);
    const res = await clearAllNotifications();
    if (res.error) showToast(res.error);
    else showToast("All alerts resolved");
    setLoading(false);
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return n.type === 'alert';
    if (filter === 'system') return ['info', 'success'].includes(n.type);
    if (filter === 'matches') return ['fixtures', 'result'].includes(n.type);
    return true;
  });

  const getIconForType = (type) => {
    switch(type) {
      case 'alert': return <AlertTriangle size={20} className="text-amber-500" />;
      case 'success': return <CheckCircle2 size={20} className="text-emerald-500" />;
      case 'fixtures': return <Activity size={20} className="text-sky-500" />;
      case 'result': return <Radio size={20} className="text-pitch-bright animate-pulse" />;
      default: return <Info size={20} className="text-indigo-400" />;
    }
  };

  const getColorForType = (type) => {
    switch(type) {
      case 'alert': return 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'success': return 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'fixtures': return 'border-sky-500/50 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.1)]';
      case 'result': return 'border-pitch-bright/50 bg-pitch-bright/10 shadow-[0_0_15px_rgba(41,193,121,0.1)]';
      default: return 'border-indigo-400/50 bg-indigo-400/10 shadow-[0_0_15px_rgba(129,140,248,0.1)]';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full min-w-0 font-sans">
      {/* Header Panel */}
      <div className="relative w-full bg-[#0a0c10] border border-border/20 rounded-[20px] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Terminal size={28} className="text-amber-500" />
              <h2 className="text-3xl font-black font-heading tracking-tight uppercase text-white m-0 leading-none">
                Command Center
              </h2>
            </div>
            <p className="text-sm font-medium text-muted-foreground ml-10">Manage system alerts, broadcast messages, and monitor real-time activity logs.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#0d1117] p-3 rounded-xl border border-border/30 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Auto Telemetry</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase ${settings.autoNotificationsEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
                  {settings.autoNotificationsEnabled ? 'ONLINE' : 'OFFLINE'}
                </span>
                <button
                  role="switch"
                  aria-checked={settings.autoNotificationsEnabled}
                  onClick={handleToggleAuto}
                  disabled={loading}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${settings.autoNotificationsEnabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-secondary border border-border'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.autoNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Broadcast Controls */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="p-6 border-border/20 bg-[#0c0e12] shadow-xl rounded-[16px]">
            <SectionTitle icon={Send}>Broadcast Alert</SectionTitle>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Protocol Level</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'info', label: 'INFO', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
                    { val: 'alert', label: 'ALERT', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
                    { val: 'success', label: 'SUCCESS', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                    { val: 'fixtures', label: 'FIXTURE', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
                  ].map(t => (
                    <button
                      key={t.val}
                      onClick={() => setForm({ ...form, type: t.val })}
                      className={`py-2 px-3 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all border ${form.type === t.val ? `${t.color} shadow-sm ring-1 ring-white/10` : 'bg-background border-border/40 text-muted-foreground hover:bg-secondary/40'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payload Data</Label>
                <Input 
                  placeholder="Enter message..." 
                  value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })}
                  className="bg-background border-border/40 focus:border-pitch transition-colors font-mono text-sm"
                />
              </div>
              <button 
                onClick={handleSendCustom} 
                disabled={loading || !form.text.trim()}
                className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-pitch hover:bg-pitch-dark text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(41,193,121,0.2)] hover:shadow-[0_0_30px_rgba(41,193,121,0.4)] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Send size={16} /> Transmit Alert
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Alert Feed */}
        <div className="flex flex-col lg:col-span-2">
          <Card className="p-6 h-full border-border/20 bg-[#0c0e12] shadow-xl rounded-[16px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <SectionTitle icon={Bell} className="mb-0">Active System Log ({filteredNotifs.length})</SectionTitle>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-background border border-border/40 rounded-lg p-1">
                  {['all', 'alerts', 'matches'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${filter === f ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                {notifications.length > 0 && (
                  <button 
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm ml-2 cursor-pointer" 
                    onClick={handleClearAll} 
                    disabled={loading}
                  >
                    <ShieldAlert size={14} /> Resolve All
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3 min-h-[300px]">
              <AnimatePresence>
                {filteredNotifs.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center">
                    <EmptyState text="System logic normal. No active alerts." />
                  </motion.div>
                ) : (
                  filteredNotifs.map((n, i) => (
                    <motion.div 
                      key={n.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0a0c10] border ${getColorForType(n.type)} rounded-xl gap-4 group`}
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="p-2.5 bg-background/50 rounded-lg shrink-0">
                          {getIconForType(n.type)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{n.type}</span>
                            <span className="text-[10px] text-muted-foreground opacity-60 font-mono">• {new Date(n.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <span className="text-sm font-semibold text-white leading-tight">{n.text}</span>
                        </div>
                      </div>
                      <button 
                        className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-background hover:bg-secondary border border-border/40 rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm group-hover:border-border/80" 
                        onClick={() => handleDelete(n.id)} 
                        disabled={loading}
                      >
                        <CheckCircle2 size={14} /> Resolve
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

