import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ExoSuit Lab',
  description: 'Futuristic holographic exo-suit builder controlled by hand gestures.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
