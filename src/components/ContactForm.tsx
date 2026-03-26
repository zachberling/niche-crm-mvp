import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'
import { Contact, CreateContact, CreateContactSchema } from '@/types/contact'

interface Props {
  contact?: Contact | null
  onClose: () => void
}

const empty: CreateContact = {
  firstName: '', lastName: '', email: '', phone: '',
  company: '', status: 'lead', notes: '',
}

export function ContactForm({ contact, onClose }: Props) {
  const { addContact, updateContact } = useCRMStore()
  const [form, setForm] = useState<CreateContact>(
    contact ? {
      firstName: contact.firstName, lastName: contact.lastName,
      email: contact.email ?? '', phone: contact.phone ?? '',
      company: contact.company ?? '', status: contact.status,
      notes: contact.notes ?? '',
    } : empty
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = useCallback((field: keyof CreateContact, value: string) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = CreateContactSchema.safeParse(form)
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.issues.forEach((i) => { if (i.path[0]) errs[String(i.path[0])] = i.message })
      setErrors(errs)
      return
    }
    if (contact) {
      updateContact(contact.id, form)
    } else {
      addContact(form)
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{contact ? 'Edit Contact' : 'New Contact'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <Field label="First Name *" error={errors.firstName}>
                <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)}
                  className={errors.firstName ? 'error' : ''} placeholder="Jane" autoFocus data-testid="input-firstName" />
              </Field>
              <Field label="Last Name *" error={errors.lastName}>
                <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)}
                  className={errors.lastName ? 'error' : ''} placeholder="Smith" data-testid="input-lastName" />
              </Field>
            </div>
            <Field label="Email" error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                className={errors.email ? 'error' : ''} placeholder="jane@example.com" data-testid="input-email" />
            </Field>
            <div className="form-row">
              <Field label="Phone">
                <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  placeholder="+1 555 000 0000" data-testid="input-phone" />
              </Field>
              <Field label="Company">
                <input value={form.company} onChange={(e) => set('company', e.target.value)}
                  placeholder="Acme Inc." data-testid="input-company" />
              </Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value as CreateContact['status'])} data-testid="input-status">
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                placeholder="Any notes about this contact…" data-testid="input-notes" />
            </Field>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" data-testid="submit-btn">
                {contact ? 'Save Changes' : 'Add Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {error && <span className="error-text">{error}</span>}
    </div>
  )
}
