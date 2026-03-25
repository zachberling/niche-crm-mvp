import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContactList } from './components/ContactList'
import { AddContactForm } from './components/AddContactForm'
import { Contact, CreateContact } from './types/contact'
import { v4 as uuidv4 } from 'uuid'

const queryClient = new QueryClient()

function App() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showForm, setShowForm] = useState(false)

  const handleAddContact = (contactData: CreateContact) => {
    const newContact: Contact = {
      ...contactData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setContacts(prev => [...prev, newContact])
    setShowForm(false)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1>Niche CRM MVP</h1>
        
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Contact'}
        </button>

        {showForm && (
          <AddContactForm 
            onSubmit={handleAddContact}
            onCancel={() => setShowForm(false)}
          />
        )}

        <ContactList 
          contacts={contacts}
        />
      </div>
    </QueryClientProvider>
  )
}

export default App
