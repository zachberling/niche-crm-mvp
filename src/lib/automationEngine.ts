import { useHVACStore } from '@/store/hvacStore'
import { useCRMStore } from '@/store/crmStore'

// Fire automations for a given trigger event
export async function fireAutomations(
  trigger: string,
  context: Record<string, unknown>
): Promise<void> {
  const { automations, integrations } = useHVACStore.getState()
  const matching = automations.filter((a) => a.enabled && a.trigger === trigger)
  if (!matching.length) return

  try {
    await fetch('/api/fire-automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger, context, automations: matching, integrations }),
    })
    // Increment run counts
    matching.forEach((rule) => {
      useHVACStore.getState().updateAutomation(rule.id, {
        runCount: rule.runCount + 1,
        lastRunAt: new Date(),
      })
    })
  } catch {
    // Non-blocking — automation failures don't break the UI
  }
}

// Build context object from a contact
export function contactContext(contactId: string): Record<string, unknown> {
  const contact = useCRMStore.getState().contacts.find((c) => c.id === contactId)
  if (!contact) return {}
  return {
    name: `${contact.firstName} ${contact.lastName}`,
    firstName: contact.firstName,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    company: contact.company ?? '',
  }
}
