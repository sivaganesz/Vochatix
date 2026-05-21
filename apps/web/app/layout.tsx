import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Vochatix — Real-Time Chat & Video',
  description: 'Chat and video call app with real-time messaging and LiveKit integration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
