'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/bracket', label: 'Bracket' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">⚽</span>
            <div>
              <span className="font-bold text-gold text-lg tracking-tight">
                WC 2026
              </span>
              <span className="hidden sm:inline text-text-secondary text-sm ml-2">
                Sweepstake
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
