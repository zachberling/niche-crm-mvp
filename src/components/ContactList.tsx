import { Contact } from '@/types/contact'

interface ContactListProps {
  contacts: Contact[]
  onContactClick?: (contact: Contact) => void
}

export function ContactList({ contacts, onContactClick }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="empty-state">
        <p>No contacts yet. Add your first contact to get started!</p>
      </div>
    )
  }

  return (
    <div className="contact-list">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="contact-card"
          onClick={() => onContactClick?.(contact)}
        >
          <div className="contact-header">
            <h3>{contact.firstName} {contact.lastName}</h3>
            <span className={`status-badge status-${contact.status}`}>
              {contact.status}
            </span>
          </div>
          
          {contact.company && (
            <p className="contact-company">{contact.company}</p>
          )}
          
          <div className="contact-details">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>{contact.phone}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
