import './globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { Sora, Chakra_Petch, Plus_Jakarta_Sans } from 'next/font/google';

const sora = Sora({ 
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-sora',
});

const chakra = Chakra_Petch({ 
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-chakra',
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jakarta',
});

export const metadata = {
  title: 'Golazo Hub',
  description: 'Matchday central for the crew',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Golazo Hub',
  },
  icons: {
    icon: '/icons/golazohub.png',
    apple: '/icons/golazohub.png',
  },
};

export const viewport = {
  themeColor: '#09090b',
};

import AppThemeProvider from '@/pwa/components/AppThemeProvider';
import InstallPrompt from '@/pwa/components/InstallPrompt';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${sora.variable} ${chakra.variable} font-sans`}>
        <AppThemeProvider />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
