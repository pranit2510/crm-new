import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';import { ClientLayout } from "@/components/layout/ClientLayout";
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VoltFlow CRM',
  description: 'Electrical Services CRM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>       
           </AuthProvider>
      </body>
    </html>
  );
}