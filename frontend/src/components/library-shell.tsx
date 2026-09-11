import { BookOpen, CirclePlus, LibraryBig, Menu, Search, Sparkles, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

export function LibraryShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [
    { href: '/', label: 'Take a Book, Leave a Book', icon: LibraryBig },
    { href: '/add', label: 'Just Leave a Book', icon: CirclePlus },
    { href: '/requests', label: 'Request a Book', icon: Search },
  ];
  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="page-shell flex h-[76px] items-center justify-between">
          <Link href="/" data-testid="link-home" className="group flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-[14px] bg-sidebar text-sidebar-foreground shadow-sm">
              <BookOpen size={22} strokeWidth={1.8} />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
            </span>
            <span className="leading-none">
               <span className="block font-display text-[21px] font-semibold tracking-[-.03em]">The Blue <span className="text-primary">Library</span></span>
               <span className="mt-1 block font-mono-ui text-[9px] uppercase tracking-[.15em] text-muted-foreground">take a book / leave a book</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${location === href ? 'bg-sidebar text-sidebar-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Icon size={16} strokeWidth={2} /> {label}
              </Link>
            ))}
          </nav>
          <button type="button" data-testid="button-mobile-menu" onClick={() => setMenuOpen(!menuOpen)} className="rounded-full p-2.5 text-foreground hover:bg-muted md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="page-shell border-t border-border/70 py-3 md:hidden" aria-label="Mobile navigation">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-${href.slice(1) || 'home'}-${label.split(' ')[0].toLowerCase()}`} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${location === href ? 'bg-sidebar text-sidebar-foreground' : 'text-muted-foreground'}`}>
                <Icon size={17} /> {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="page-shell flex flex-col gap-3 border-t border-border/70 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2"><Sparkles size={13} className="text-primary" /> Keep a good story moving.</p>
        <p className="font-mono-ui text-[10px] uppercase tracking-[.14em]">The Blue Library / open to everyone</p>
      </footer>
    </div>
  );
}