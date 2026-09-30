import { useMemo } from 'react';
import { ArrowLeft, Pencil, UserPlus } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetContactQueryKey, getGetContactSummaryQueryKey, getListContactsQueryKey, useCreateContact, useGetContact, useUpdateContact } from '@workspace/api-client-react';
import { ContactForm, type ContactFormValues } from '@/components/contact-form';
import { PageLoading } from '@/components/app-shell';

export default function ContactEditor() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isNew = !params.id || params.id === 'new';
  const contactId = Number(params.id);
  const contactQuery = useGetContact(contactId, { query: { enabled: !isNew && Number.isFinite(contactId), queryKey: getGetContactQueryKey(contactId) } });
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const contact = contactQuery.data;
  const initialValues = useMemo(() => contact ? { name: contact.name, phoneNumber: contact.phoneNumber, relationship: contact.relationship, address: contact.address } : undefined, [contact]);
  const mutation = isNew ? createContact : updateContact;
  const serverError = mutation.isError ? 'We could not save this contact. Please check the details and try again.' : undefined;

  const handleSubmit = (values: ContactFormValues) => {
    if (isNew) {
      createContact.mutate({ data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetContactSummaryQueryKey() });
          setLocation('/contacts');
        },
      });
    } else {
      updateContact.mutate({ id: contactId, data: values }, {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetContactQueryKey(contactId), updated);
          queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetContactSummaryQueryKey() });
          setLocation('/contacts');
        },
      });
    }
  };

  if (!isNew && contactQuery.isLoading) return <main className="content-wrap"><PageLoading /></main>;
  if (!isNew && contactQuery.isError) return <main className="content-wrap"><div className="error-box page-enter" data-testid="status-contact-error"><strong>We could not find this contact.</strong><span>It may have been removed already.</span></div><Link href="/contacts" className="button button-quiet" style={{ marginTop: 18 }} data-testid="link-back-contacts-error"><ArrowLeft size={16} /> Back to contacts</Link></main>;

  return (
    <main className="content-wrap page-enter">
      <div className="editor-shell">
        <Link href="/contacts" className="button button-quiet" data-testid="link-back-contacts"><ArrowLeft size={16} /> Back to contacts</Link>
        <div className="editor-panel panel">
          <div className="editor-heading">
            <div><div className="eyebrow">{isNew ? 'New entry' : 'Update details'}</div><h1 className="page-title" style={{ fontSize: 'clamp(34px, 5vw, 52px)' }}>{isNew ? 'Add a contact' : 'Edit contact'}</h1><p>{isNew ? 'Save the people you would want nearby in an emergency.' : 'Keep this person’s information accurate and easy to use.'}</p></div>
            <div className="quick-icon">{isNew ? <UserPlus size={20} /> : <Pencil size={19} />}</div>
          </div>
          <ContactForm initialValues={initialValues} submitLabel={isNew ? 'Save contact' : 'Save changes'} isPending={mutation.isPending} serverError={serverError} onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  );
}