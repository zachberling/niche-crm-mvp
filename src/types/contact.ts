import { z } from 'zod'

export const ContactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['lead', 'active', 'inactive']),
  source: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Contact = z.infer<typeof ContactSchema>

export const CreateContactSchema = ContactSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateContact = z.infer<typeof CreateContactSchema>
