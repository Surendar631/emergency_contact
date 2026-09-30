import { useMemo, useState } from 'react';
import { Edit3, MapPin, Phone, Plus, Search, Trash2, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetContactSummaryQueryKey, getListContactsQueryKey, useDeleteContact, useListContacts } from '@workspace/api-client-react';
import { EmptyIcon, PageLoading } from '@/components/app-shell';

export default function Contacts() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const params = useMemo(() => search.trim() ? { search: search.trim() } : undefined, [search]);
  const contactsQuery = useListContacts(params, { query: { queryKey: getListContactsQueryKey(params) } });
  const deleteContact = useDeleteContact();
  const contacts = contactsQuery.data ?? [];

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Remove ${name} from your emergency contacts?`)) return;
    deleteContact.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetContactSummaryQueryKey() });
      },
    });
  };

  return (
    <main className="content-wrap page-enter">
      <div className="header-row">
        <div><div className="eyebrow">Your circle</div><h1 className="page-title">All contacts</h1><p className="page-lead">The people you can count on, organized for a clear head.</p></div>
        <Link href="/contacts/new" className="button button-primary" data-testid="link-add-contact-header"><Plus size={17} /> Add a contact</Link>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input className="search-input" data-testid="input-search-contacts" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, relationship, or phone" aria-label="Search contacts" />
        </div>
      </div>

      {contactsQuery.isLoading ? <div className="contact-list"><div className="skeleton skeleton-card" /><div className="skeleton skeleton-card" /><div className="skeleton skeleton-card" /></div> : null}
      {contactsQuery.isError ? <div className="error-box" data-testid="status-contacts-error"><strong>Contacts are taking a moment.</strong><span>Refresh the page and try again.</span></div> : null}
      {!contactsQuery.isLoading && !contactsQuery.isError && contacts.length === 0 ? (
        <div className="empty-state" data-testid="empty-contacts">
          <EmptyIcon />
          <h3>{search ? 'No matches found' : 'Your circle is still small'}</h3>
          <p>{search ? `Nothing matched “${search}”. Try a different name or clear the search.` : 'Add the first trusted person so their details are ready when you need them.'}</p>
          {search ? <button className="button button-quiet" onClick={() => setSearch('')} data-testid="button-clear-search">Clear search</button> : <Link href="/contacts/new" className="button button-primary" data-testid="link-empty-add-contact"><Plus size={16} /> Add first contact</Link>}
        </div>
      ) : null}
      {!contactsQuery.isLoading && !contactsQuery.isError && contacts.length > 0 ? (
        <div className="contact-list" data-testid="list-contacts">
          {contacts.map((contact) => (
            <article className="contact-row" key={contact.id} data-testid={`row-contact-${contact.id}`}>
              <div className="contact-identity"><div className="avatar">{contact.name.slice(0, 1).toUpperCase()}</div><div><div className="contact-name">{contact.name}</div><div className="contact-meta">{contact.relationship}</div></div></div>
              <div className="row-detail"><span className="row-label"><Phone size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} /> Phone</span><span className="row-value">{contact.phoneNumber}</span></div>
              <div className="row-detail"><span className="row-label"><MapPin size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} /> Location</span><span className="row-value">{contact.address}</span></div>
              <div className="row-actions">
                <Link href={`/contacts/${contact.id}/edit`} className="button button-quiet button-icon" data-testid={`button-edit-contact-${contact.id}`} aria-label={`Edit ${contact.name}`}><Edit3 size={15} /></Link>
                <button className="button button-danger button-icon" onClick={() => handleDelete(contact.id, contact.name)} disabled={deleteContact.isPending} data-testid={`button-delete-contact-${contact.id}`} aria-label={`Delete ${contact.name}`}><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {deleteContact.isError && <div className="notice notice-error" data-testid="status-delete-error">That contact could not be removed. Please try again.</div>}
      {deleteContact.isPending && <div className="notice notice-success" data-testid="status-delete-pending"><UsersRound size={15} /> Removing contact…</div>}
    </main>
  );
}