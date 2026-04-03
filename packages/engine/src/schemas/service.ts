import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    // Core Identity
    defineField({
      name: 'name',
      title: 'Service Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: Rule => Rule.required()
    }),

    // Description
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 6,
      description: 'Detailed service description'
    }),
    defineField({
      name: 'excerpt',
      title: 'Short Description',
      type: 'string',
      description: 'Brief summary for cards/previews (max 160 chars)'
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true }
    }),

    // Relationships
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'reference',
      to: [{ type: 'provider' }],
      validation: Rule => Rule.required(),
      description: 'Who provides this service'
    }),
    defineField({
      name: 'business',
      title: 'Business Location',
      type: 'reference',
      to: [{ type: 'business' }],
      description: 'Where this service is offered (optional)'
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    }),

    // Pricing
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'object',
      fields: [
        {
          name: 'type',
          title: 'Pricing Type',
          type: 'string',
          options: {
            list: [
              { title: 'Fixed Price', value: 'fixed' },
              { title: 'Hourly Rate', value: 'hourly' },
              { title: 'Package/Bundle', value: 'package' },
              { title: 'Contact for Quote', value: 'quote' }
            ]
          },
          initialValue: 'fixed'
        },
        {
          name: 'amount',
          title: 'Price Amount',
          type: 'number',
          description: 'Base price (leave empty for "Contact for Quote")'
        },
        {
          name: 'currency',
          title: 'Currency',
          type: 'string',
          initialValue: 'USD'
        },
        {
          name: 'packages',
          title: 'Package Options',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'name', type: 'string', title: 'Package Name' },
              { name: 'price', type: 'number', title: 'Price' },
              { name: 'sessions', type: 'number', title: 'Number of Sessions' },
              { name: 'description', type: 'string', title: 'Description' }
            ]
          }]
        }
      ]
    }),

    // Service Delivery
    defineField({
      name: 'duration',
      title: 'Duration (minutes)',
      type: 'number',
      description: 'Typical session length in minutes'
    }),
    defineField({
      name: 'deliveryMode',
      title: 'Delivery Mode',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'In-Person', value: 'in-person' },
          { title: 'Online/Virtual', value: 'online' },
          { title: 'Hybrid', value: 'hybrid' }
        ]
      }
    }),
    defineField({
      name: 'maxParticipants',
      title: 'Max Participants',
      type: 'number',
      description: 'Maximum number of participants (leave empty for one-on-one)'
    }),
    defineField({
      name: 'minParticipants',
      title: 'Min Participants',
      type: 'number',
      description: 'Minimum required for group sessions'
    }),

    // Booking Integration
    defineField({
      name: 'bookingIntegration',
      title: 'Booking Integration',
      type: 'object',
      fields: [
        {
          name: 'type',
          title: 'Booking System',
          type: 'string',
          options: {
            list: [
              { title: 'None (Contact Only)', value: 'none' },
              { title: 'Calendly', value: 'calendly' },
              { title: 'Custom URL', value: 'custom' }
            ]
          },
          initialValue: 'none'
        },
        {
          name: 'url',
          title: 'Booking URL',
          type: 'url',
          description: 'Direct link to booking page'
        }
      ]
    }),

    // Requirements & Audience
    defineField({
      name: 'requirements',
      title: 'Requirements',
      type: 'text',
      rows: 3,
      description: 'What clients need to bring, prerequisites, etc.'
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Who is this service for? (e.g., "Beginners", "Athletes")'
    }),

    // SEO
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string'
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2
    }),

    // System Fields
    defineField({
      name: 'siteId',
      title: 'Site ID',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
      description: 'Only published services appear on site'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'provider.name',
      media: 'featuredImage',
      price: 'pricing.amount'
    },
    prepare(selection) {
      const { title, subtitle, media, price } = selection
      return {
        title,
        subtitle: subtitle ? `${subtitle}${price ? ` - $${price}` : ''}` : (price ? `$${price}` : 'Contact for pricing'),
        media
      }
    }
  }
})
