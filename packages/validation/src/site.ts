import { z } from 'zod'

export const subdomainSchema = z
  .string()
  .min(3, 'Subdomain must be at least 3 characters')
  .max(63)
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    'Subdomain can only contain lowercase letters, numbers, and hyphens'
  )

export const siteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(100),
  subdomain: subdomainSchema,
  tagline: z.string().max(200).optional(),
  templateId: z.string().optional(),
})

export type SiteInput = z.infer<typeof siteSchema>
export type SubdomainInput = z.infer<typeof subdomainSchema>
