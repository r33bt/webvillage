import businessSchema from './business'
import providerSchema from './provider'
import serviceSchema from './service'
import reviewSchema from './review'
import categorySchema from './category'
import softwareSchema from './software'

export { businessSchema, providerSchema, serviceSchema, reviewSchema, categorySchema, softwareSchema }

/** Convenience array — pass to `defineConfig({ schema: { types: directorySchemas } })` */
export const directorySchemas = [
  businessSchema,
  providerSchema,
  serviceSchema,
  reviewSchema,
  categorySchema,
  softwareSchema,
]

// Re-export individual schemas for targeted imports
export { default as business } from './business'
export { default as provider } from './provider'
export { default as service } from './service'
export { default as review } from './review'
export { default as category } from './category'
export { default as software } from './software'
