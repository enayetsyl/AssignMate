import type { Metadata } from 'next';
import { Geist, Geist_Mono, Patrick_Hand  } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  variable: '--font-kids',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'AssignMate',
  description: 'Generated school assignment easily.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
  className={`${geistSans.variable} ${geistMono.variable} ${patrickHand.variable} antialiased`}
>

        <header>
          <Navbar/>
        </header>
        <main>
        {children}
        </main>
      </body>
    </html>
  );
}
