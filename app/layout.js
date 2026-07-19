import './globals.css';

export const metadata = {
  title: 'Golazo Hub - Friends eLeague',
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
