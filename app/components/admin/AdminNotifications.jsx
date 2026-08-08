'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Send, Settings, ShieldAlert } from 'lucide-react';
import { Card, SectionTitle, EmptyState, Btn, Input, Label, Badge } from '@/app/components/shared/UI';
import { getSystemSettings, updateSystemSettings, createCustomNotification, deleteCustomNotification, clearAllNotifications } from '@/app/actions/admin';
import { supabase } from '@/lib/supabaseClient';

export default function AdminNotifications({ notifications = [], showToast }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ autoNotificationsEnabled: true });
  
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
      showToast("Notification sent!");
      setForm({ text: '', type: 'info' });
      // Notify clients to refresh
      supabase.channel('league-events').send({ type: 'broadcast', event: 'notification_refresh', payload: {} });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const res = await deleteCustomNotification(id);
    if (res.error) showToast(res.error);
    else showToast("Notification deleted");
    setLoading(false);
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL system notifications?")) return;
    setLoading(true);
    const res = await clearAllNotifications();
    if (res.error) showToast(res.error);
    else showToast("All notifications cleared");
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Settings Panel */}
      <Card className="p-6 border-amber-500/30">
        <SectionTitle icon={Settings}>System Control</SectionTitle>
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg mt-4 border border-border/50">
          <div>
            <h4 className="font-bold text-sm">Automated System Notifications</h4>
            <p className="text-xs text-muted-foreground mt-1">
              When enabled, the system automatically creates notifications for live matches, generated fixtures, season completions, etc.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={settings.autoNotificationsEnabled}
            onClick={handleToggleAuto}
            disabled={loading}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${settings.autoNotificationsEnabled ? 'bg-pitch' : 'bg-secondary border border-border'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.autoNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </Card>

      {/* Send Custom Notification */}
      <Card className="p-6">
        <SectionTitle icon={Send}>Send Notification</SectionTitle>
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <Label>Notification Text</Label>
            <Input 
              placeholder="e.g., Server maintenance in 1 hour" 
              value={form.text}
              onChange={e => setForm({ ...form, text: e.target.value })}
            />
          </div>
          <div>
            <Label>Type</Label>
            <select 
              className="w-full bg-secondary border border-border/50 rounded-lg p-2.5 text-sm outline-none focus:border-pitch"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="info">Info (Default)</option>
              <option value="alert">Alert (Warning)</option>
              <option value="success">Success</option>
              <option value="fixtures">Fixtures</option>
              <option value="result">Match Result</option>
            </select>
          </div>
          <Btn onClick={handleSendCustom} loading={loading} className="mt-2">
            Send to All Users
          </Btn>
        </div>
      </Card>

      {/* Notification List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={Bell}>Notification Feed ({notifications.length})</SectionTitle>
          {notifications.length > 0 && (
            <Btn variant="danger" className="text-xs h-8" onClick={handleClearAll} loading={loading}>
              <ShieldAlert size={14} className="mr-1" /> Clear All
            </Btn>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <EmptyState text="No notifications in the system." />
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map(n => (
              <div key={n.id} className="flex items-center justify-between p-3 bg-secondary/20 border border-border/30 rounded-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge color="var(--pitch)" className="text-[10px]">{n.type}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <span className="text-sm font-semibold">{n.text}</span>
                </div>
                <Btn variant="danger" className="p-2 shrink-0" onClick={() => handleDelete(n.id)} loading={loading}>
                  <Trash2 size={16} />
                </Btn>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
