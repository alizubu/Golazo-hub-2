import './globals.css';
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${sora.variable} ${chakra.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
