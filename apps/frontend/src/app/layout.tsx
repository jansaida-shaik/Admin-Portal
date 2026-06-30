import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Codegnan Admin Portal',
  description: 'Premium-grade inventory management portal for Codegnan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen relative overflow-x-hidden selection:bg-orange-500/30 flex flex-col">
        {/* Soft cinematic light/airy background mesh matching the Sajibur mockups */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden opacity-70">
          <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-400/20 blur-[140px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-400/15 blur-[160px]" />
          <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-orange-300/10 blur-[120px]" />
        </div>

        <Toaster position="top-right" />

        <div className="flex-1 flex flex-col">
          <ThemeProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

