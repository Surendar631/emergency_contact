import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { BookOpen, LayoutDashboard, Plus, ShieldCheck, UsersRound } from 'lucide-react';

function Brand() {
  return (
    <div className="brand-mark" data-testid="brand-care-circle">
      <div className="brand-symbol"><ShieldCheck size={20} strokeWidth={2.4} /></div>
      <div>
        <div className="brand-name">Care Circle</div>
        <div className="brand-caption">Emergency contacts</div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isContacts = location.startsWith('/contacts');
  return (
    <div className="app-frame">
      <aside className="app-rail">
        <Brand />
        <nav className="rail-nav" aria-label="Main navigation">
          <div className="nav-label">Your circle</div>
          <Link href="/" className={`rail-link ${location === '/' ? 'active' : ''}`} data-testid="link-dashboard">
            <LayoutDashboard size={17} /> Overview
          </Link>
          <Link href="/contacts" className={`rail-link ${isContacts && !location.includes('/new') ? 'active' : ''}`} data-testid="link-contacts">
            <UsersRound size={17} /> All contacts
          </Link>
          <Link href="/contacts/new" className={`rail-link ${location === '/contacts/new' ? 'active' : ''}`} data-testid="link-add-contact">
            <Plus size={17} /> Add a contact
          </Link>
        </nav>
        <div className="rail-footer">
          <strong>Keep close what matters.</strong>
          A quiet place for the people you would call first.
        </div>
      </aside>
      <div className="main-column">
        <header className="mobile-topbar">
          <Brand />
          <Link href="/contacts" className="mobile-nav-link" data-testid="link-mobile-contacts" aria-label="Open contacts">
            <UsersRound size={18} />
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="page-enter" aria-label="Loading">
      <div className="skeleton" style={{ width: 100, height: 12, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: 310, height: 52, marginBottom: 30 }} />
      <div className="skeleton skeleton-card" style={{ height: 240, marginBottom: 20 }} />
      <div className="skeleton skeleton-card" />
    </div>
  );
}

export function EmptyIcon() {
  return <div className="empty-icon"><BookOpen size={21} /></div>;
}