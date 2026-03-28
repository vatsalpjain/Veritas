'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Overview',    href: '/overview',    icon: 'dashboard' },
  { label: 'Investments', href: '/investment',  icon: 'account_balance_wallet' },
  { label: 'Markets',     href: '/market',      icon: 'monitoring' },
  { label: 'Insights',    href: '/insights',    icon: 'lightbulb' },
  { label: 'Portfolio',   href: '/portfolio',   icon: 'donut_large' },
  { label: 'Reports',     href: '/reports',     icon: 'description' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="h-screen w-64 fixed left-0 top-0 z-50 flex flex-col py-6 px-4"
      style={{ backgroundColor: '#f8fafc', borderRight: '1px solid rgba(226,232,240,0.6)' }}
    >
      {/* Brand */}
      <div className="mb-10 px-3">
        <h1
          className="text-lg font-extrabold tracking-tight"
          style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
        >
          Veritas
        </h1>
        <p
          className="text-[11px] uppercase tracking-wider font-medium mt-0.5"
          style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
        >
          Wealth Management
        </p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {navLinks.map(({ label, href, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 py-2 px-3 rounded-lg text-[13px] font-medium transition-all duration-150"
              style={{
                color: isActive ? '#0f172a' : '#64748b',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                boxShadow: isActive ? '0 1px 4px rgba(11,28,48,0.07)' : 'none',
                transform: isActive ? 'translateX(2px)' : 'none',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#334155';
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#f1f5f9';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#64748b';
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto pt-6 space-y-1">
        <button
          className="w-full py-2.5 rounded-lg mb-6 text-[13px] font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#0f172a', fontFamily: 'Inter, sans-serif' }}
        >
          New Investment
        </button>

        {[
          { label: 'Support', icon: 'help' },
          { label: 'Log Out', icon: 'logout' },
        ].map(({ label, icon }) => (
          <Link
            key={label}
            href="#"
            className="flex items-center gap-3 py-2 px-3 text-[13px] font-medium transition-colors"
            style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#334155'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#64748b'; }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
            >
              {icon}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
