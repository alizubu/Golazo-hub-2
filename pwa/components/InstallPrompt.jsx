'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Btn } from '@/app/components/shared/UI';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = ('standalone' in window.navigator) && (window.navigator.standalone);
    if (isIosDevice && !isStandalone) {
      if (!localStorage.getItem('golazo_install_dismissed')) {
        setTimeout(() => {
          setIsIos(true);
          setShowPrompt(true);
        }, 3000);
      }
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('golazo_install_dismissed')) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const triggerHandler = () => {
      if (deferredPrompt && !localStorage.getItem('golazo_install_dismissed')) {
        setShowPrompt(true);
      }
    };
    
    window.addEventListener('trigger-install-prompt', triggerHandler);
    return () => window.removeEventListener('trigger-install-prompt', triggerHandler);
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setShowPrompt(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('golazo_install_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] bg-secondary/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl flex items-start gap-4"
        >
          <div className="flex-1">
            <h3 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
               Install App
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isIos ? "To install, tap the Share icon below and select 'Add to Home Screen' for full-screen offline access." : "Add Golazo Hub to your home screen for full-screen offline access and real-time updates!"}
            </p>
            <div className="flex gap-2">
              {!isIos && (
                <Btn variant="primary" onClick={handleInstall} className="flex-1 py-2 text-sm flex items-center justify-center gap-2 font-bold shadow-md">
                  <Download size={16} /> Add to Home Screen
                </Btn>
              )}
              <Btn variant="outline" onClick={handleDismiss} className="py-2 px-3 bg-background/50 hover:bg-secondary">
                <X size={16} />
              </Btn>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
