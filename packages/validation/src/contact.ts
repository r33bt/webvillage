import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  subject: z.string().max(200).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
