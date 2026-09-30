import { ArrowRight, HeartHandshake, Plus, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { useGetContactSummary, useListContacts } from '@workspace/api-client-react';
import { EmptyIcon, PageLoading } from '@/components/app-shell';

export default function Home() {
  const summaryQuery = useGetContactSummary();
  const contactsQuery = useListContacts();
  const summary = summaryQuery.data;
  const contacts = contactsQuery.data ?? [];
  const maxRelationshipCount = Math.max(...(summary?.relationships?.map((item) => item.count) ?? [1]));

  if (summaryQuery.isLoading || contactsQuery.isLoading) {
    return <main className="content-wrap"><PageLoading /></main>;
  }

  if (summaryQuery.isError || contactsQuery.isError) {
    return (
      <main className="content-wrap">
        <div className="error-box page-enter" data-testid="status-home-error">
          <strong>We could not load your circle.</strong>
          <span>Check your connection, then refresh to try again.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="content-wrap page-enter">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="hero-kicker"><HeartHandshake size={15} /> Your people, close at hand</div>
          <h1 className="hero-title">When it matters, know who to call.</h1>
          <p className="hero-text">Care Circle keeps your emergency contacts together, clear, and ready for the moment you need them.</p>
          <Link href="/contacts/new" className="button hero-action" data-testid="link-hero-add-contact"><Plus size={17} /> Add a contact</Link>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel summary-card" data-testid="card-contact-summary">
          <div className="summary-heading">
            <h2 className="section-title">Your circle at a glance</h2>
            <span className="section-note">right now</span>
          </div>
          <div className="stat-number" data-testid="text-contact-total">{summary?.total ?? 0}</div>
          <div className="stat-caption">trusted contacts saved</div>
          {summary?.relationships?.length ? (
            <div className="relationship-list">
              {summary.relationships.map((item) => (
                <div className="relationship-row" key={item.relationship} data-testid={`row-relationship-${item.relationship}`}>
                  <span className="relationship-name">{item.relationship}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(8, (item.count / maxRelationshipCount) * 100)}%` }} /></div>
                  <span className="relationship-count">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: 20, padding: 24 }}><EmptyIcon /><p style={{ marginBottom: 0 }}>Your relationship breakdown will appear here.</p></div>
          )}
        </section>

        <section className="panel quick-panel">
          <div className="summary-heading">
            <h2 className="section-title">Quick paths</h2>
            <UsersRound size={19} color="hsl(var(--primary))" />
          </div>
          <div className="quick-list">
            <Link href="/contacts" className="quick-link" data-testid="link-view-all-contacts">
              <div className="quick-icon"><UsersRound size={17} /></div>
              <div className="quick-copy"><strong>View all contacts</strong><span>Search your full circle</span></div>
              <ArrowRight size={16} />
            </Link>
            <Link href="/contacts/new" className="quick-link" data-testid="link-quick-add-contact">
              <div className="quick-icon"><Plus size={17} /></div>
              <div className="quick-copy"><strong>Add someone new</strong><span>Keep your list current</span></div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>

      <div className="insight-strip" data-testid="status-circle-insight">
        <HeartHandshake size={19} color="hsl(var(--accent))" />
        <p>{summary?.total ? <><strong>A little preparation goes a long way.</strong> Your circle has {summary.total} {summary.total === 1 ? 'person' : 'people'} ready when you need them.</> : <><strong>Start with one trusted person.</strong> Add someone you would want beside you in a difficult moment.</>}</p>
      </div>

      {!!contacts.length && (
        <section style={{ marginTop: 32 }}>
          <div className="summary-heading"><h2 className="section-title">Recently added</h2><Link href="/contacts" className="section-note" data-testid="link-see-recent-contacts">See everyone <ArrowRight size={13} style={{ verticalAlign: '-2px' }} /></Link></div>
          <div className="contact-list">
            {contacts.slice(0, 3).map((contact) => (
              <div className="contact-row" key={contact.id} data-testid={`card-recent-contact-${contact.id}`}>
                <div className="contact-identity"><div className="avatar">{contact.name.slice(0, 1).toUpperCase()}</div><div><div className="contact-name">{contact.name}</div><div className="contact-meta">{contact.relationship}</div></div></div>
                <div className="row-detail"><span className="row-label">Phone</span><span className="row-value">{contact.phoneNumber}</span></div>
                <div className="row-detail"><span className="row-label">Location</span><span className="row-value">{contact.address}</span></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}