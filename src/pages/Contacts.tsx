import { useState, useMemo } from 'react'
import { Search, Plus, Trash2, Edit2 } from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'
import { Contact } from '@/types/contact'
import { ContactForm } from '@/components/ContactForm'
import { ContactDetail } from '@/components/ContactDetail'

type Filter = 'all' | 'lead' | 'active' | 'inactive'

export function Contacts() {
  const { contacts, deleteContact } = useCRMStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [showForm, setShowForm] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const filtered = useMemo(() => {
    let list = contacts
    if (filter !== 'all') list = list.filter((c) => c.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) =>
        [c.firstName, c.lastName, c.email, c.company, c.phone]
          .filter(Boolean).some((f) => f!.toLowerCase().includes(q))
      )
    }
    return list
  }, [contacts, filter, search])

  const counts = useMemo(() => ({
    all: contacts.length,
    lead: contacts.filter((c) => c.status === 'lead').length,
    active: contacts.filter((c) => c.status === 'active').length,
    inactive: contacts.filter((c) => c.status === 'inactive').length,
  }), [contacts])

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Contacts</h1>
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="search-input"
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)} data-testid="add-contact-btn">
          <Plus size={15} /> Add Contact
        </button>
      </div>

      <div className="page-content fade-in">
        <div className="filter-bar" style={{ marginBottom: 20 }}>
          {(['all', 'lead', 'active', 'inactive'] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-chip${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>{search || filter !== 'all' ? 'No results found' : 'No contacts yet'}</h3>
              <p>{search || filter !== 'all' ? 'Try adjusting your search or filter' : 'Add your first contact to get started'}</p>
              {!search && filter === 'all' && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                  <Plus size={14} /> Add Contact
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} onClick={() => setSelectedContact(c)} data-testid="contact-row">
                      <td>
                        <div className="contact-name-cell">
                          <div className="contact-avatar">{c.firstName[0]}{c.lastName[0]}</div>
                          <div>
                            <div className="contact-name">{c.firstName} {c.lastName}</div>
                            {c.email && <div className="contact-email">{c.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{c.company || '—'}</td>
                      <td className="text-muted">{c.phone || '—'}</td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                      <td className="text-muted text-sm">{c.createdAt.toLocaleDateString()}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => { setEditContact(c); setShowForm(true) }}
                            title="Edit"
                            data-testid="edit-btn"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => { deleteContact(c.id); if (selectedContact?.id === c.id) setSelectedContact(null) }}
                            title="Delete"
                            data-testid="delete-btn"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ContactForm
          contact={editContact}
          onClose={() => { setShowForm(false); setEditContact(null) }}
        />
      )}

      {selectedContact && !showForm && (
        <ContactDetail
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onEdit={() => { setEditContact(selectedContact); setShowForm(true) }}
        />
      )}
    </>
  )
}
