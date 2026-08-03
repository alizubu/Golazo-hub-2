'use client';

import { useEffect } from 'react';

export function updateAppTheme(iconName, themeColor) {
  localStorage.setItem('golazo_app_icon', iconName);
  if (themeColor) localStorage.setItem('golazo_theme_color', themeColor);
  
  const iconUrls = {
    default: '/icons/icon-default.svg',
    red: '/icons/icon-red.svg',
    blue: '/icons/icon-blue.svg',
    green: '/icons/icon-green.svg',
  };
  const newIcon = iconUrls[iconName] || iconUrls.default;

  const links = document.querySelectorAll("link[rel*='icon']");
  links.forEach(link => {
    link.href = newIcon;
  });

  if (themeColor) {
    const themeMeta = document.querySelector("meta[name='theme-color']");
    if (themeMeta) {
      themeMeta.content = themeColor;
    }
  }
}

export default function AppThemeProvider() {
  useEffect(() => {
    const savedIcon = localStorage.getItem('golazo_app_icon') || 'default';
    const savedThemeColor = localStorage.getItem('golazo_theme_color') || '#09090b';
    updateAppTheme(savedIcon, savedThemeColor);
  }, []);

  return null;
}
