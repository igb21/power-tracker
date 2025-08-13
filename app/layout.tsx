// app/layout.tsx
import './globals.css';
import TopNavbar from '@/components/TopNavbar';
import Footer  from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'World Power Tracker',
  description: 'Global capacity insights & visualizations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

<html className="h-full">


  

<body>
  <div className="w-full px-2 xl:px-4 2xl:px-12">
  <div className="max-w-[90vw] xl:max-w-[1600px] 2xl:max-w-[2400px] mx-auto">
       {/* Sticky Top Navbar */}
    <TopNavbar />
      
<main className="relative flex-1  p-3 overflow-y-auto">

        {/* Background logo */}
<div className="absolute bottom-14 left-6 opacity-50 pointer-events-none select-none z-0">
  
</div>
      {children}
    </main>
    <Footer />
  </div>
</div>


  </body>
 
</html>


  );
}