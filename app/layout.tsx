// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import TopNavbar from '@/components/TopNavbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'World Power Tracker',
  description: 'Global capacity insights & visualizations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopNavbar />
        <main className="container-fluid px-3 px-xl-4 py-3">
          <div className="mx-auto" style={{ maxWidth: '1600px' }}>
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
