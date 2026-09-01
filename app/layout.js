import './globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { Sora, Chakra_Petch, Plus_Jakarta_Sans, Hind_Siliguri } from 'next/font/google';

const sora = Sora({ 
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const chakra = Chakra_Petch({ 
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-chakra',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://golazoohub.vercel.app'),
  title: 'Golazo Hub',
  description: 'Matchday central for the crew — Track live scores, standings, and player stats.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Golazo Hub',
    startupImage: '/icons/golazohub.png',
  },
  icons: {
    icon: [
      { url: '/icons/golazohub.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/golazohub.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/golazohub.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

import AppThemeProvider from '@/pwa/components/AppThemeProvider';
import InstallPrompt from '@/pwa/components/InstallPrompt';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${sora.variable} ${chakra.variable} ${hindSiliguri.variable} font-sans`}>
        <AppThemeProvider />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
