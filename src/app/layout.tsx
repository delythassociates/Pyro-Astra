import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { DashboardProvider } from '../context/DashboardContext';
import { UserGuideDrawer } from '../components/UserGuideDrawer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PYRO-ASTRA | NASA PSI Spacecraft Combustion Evidence & Gap Audit',
  description:
    'Daylight-first scientific audit of the NASA Physical Sciences Informatics (PSI) combustion record. Visualizing flight evidence, flow regimes, and the lunar habitat atmosphere gap.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F1EA] text-[#181615] font-sans selection:bg-[#1D4ED8] selection:text-white">
        <DashboardProvider>
          <Navigation />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <UserGuideDrawer />
        </DashboardProvider>
      </body>
    </html>
  );
}
