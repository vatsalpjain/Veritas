import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';
import SharedTopNav from '@/app/components/SharedTopNav';

export const metadata: Metadata = {
  title: 'Overview | Equitas Ledger',
  description: 'Portfolio overview dashboard',
};

export default function OverviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overview-root flex min-h-screen"
      style={{ fontFamily: 'var(--font-inter), sans-serif' }}
    >
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <SharedTopNav />
        <main className="p-8 space-y-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
