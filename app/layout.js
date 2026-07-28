import './globals.css';

export const metadata = {
  title: 'Golazo Hub',
  description: 'Matchday central for the crew',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
