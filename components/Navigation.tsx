'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/bracket', label: 'Bracket' },
  { href: '/timetable', label: 'Timetable' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border-subtle bg-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-xl">⚽</span>
            <span className="text-sm font-medium tracking-tight text-text-primary">
              WC 2026
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-text-primary font-medium bg-white/[0.07]'
                      : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
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
