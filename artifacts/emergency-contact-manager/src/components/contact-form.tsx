import { type FormEvent, useEffect, useState } from 'react';
import { Check, MapPin, Phone, UserRound } from 'lucide-react';

export type ContactFormValues = {
  name: string;
  phoneNumber: string;
  relationship: string;
  address: string;
};

type ContactFormProps = {
  initialValues?: Partial<ContactFormValues>;
  submitLabel: string;
  isPending?: boolean;
  serverError?: string;
  onSubmit: (values: ContactFormValues) => void;
};

const emptyValues: ContactFormValues = { name: '', phoneNumber: '', relationship: '', address: '' };

export function ContactForm({ initialValues, submitLabel, isPending = false, serverError, onSubmit }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>({ ...emptyValues, ...initialValues });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues });
  }, [initialValues]);

  const update = (field: keyof ContactFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof ContactFormValues, string>> = {};
    if (!values.name.trim()) next.name = 'Add their name so you can find them quickly.';
    if (values.phoneNumber.trim().length < 3) next.phoneNumber = 'Enter a phone number.';
    if (!values.relationship.trim()) next.relationship = 'Describe how you know them.';
    if (!values.address.trim()) next.address = 'Add an address or a useful location note.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) onSubmit({ name: values.name.trim(), phoneNumber: values.phoneNumber.trim(), relationship: values.relationship.trim(), address: values.address.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label className="field">
          <span className="field-label"><UserRound size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} /> Full name</span>
          <input className="field-input" data-testid="input-contact-name" value={values.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Mira Patel" maxLength={120} />
          {errors.name && <span className="field-error" data-testid="error-contact-name">{errors.name}</span>}
        </label>
        <label className="field">
          <span className="field-label"><Phone size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} /> Phone number</span>
          <input className="field-input" data-testid="input-contact-phone" value={values.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} placeholder="e.g. (415) 555-0184" type="tel" maxLength={40} />
          {errors.phoneNumber && <span className="field-error" data-testid="error-contact-phone">{errors.phoneNumber}</span>}
        </label>
        <label className="field">
          <span className="field-label">Relationship</span>
          <input className="field-input" data-testid="input-contact-relationship" value={values.relationship} onChange={(e) => update('relationship', e.target.value)} placeholder="e.g. Aunt, neighbor, family doctor" maxLength={80} />
          {errors.relationship && <span className="field-error" data-testid="error-contact-relationship">{errors.relationship}</span>}
        </label>
        <label className="field field-wide">
          <span className="field-label"><MapPin size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} /> Address or location</span>
          <span className="field-hint">A home address, clinic, workplace, or anything that helps you reach them.</span>
          <textarea className="field-input" data-testid="input-contact-address" value={values.address} onChange={(e) => update('address', e.target.value)} placeholder="e.g. 18 Juniper Street, Oakland" maxLength={300} />
          {errors.address && <span className="field-error" data-testid="error-contact-address">{errors.address}</span>}
        </label>
      </div>
      {serverError && <div className="notice notice-error" data-testid="status-form-error">{serverError}</div>}
      <div className="form-actions">
        <button type="submit" className="button button-primary" disabled={isPending} data-testid="button-save-contact">
          <Check size={16} /> {isPending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}