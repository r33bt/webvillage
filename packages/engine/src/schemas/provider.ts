import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'provider',
  title: 'Provider',
  type: 'document',
  fields: [
    // Core Identity
    defineField({
      name: 'name',
      title: 'Provider Name',
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
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short professional headline (e.g., "Board-Certified Acupuncturist")'
    }),

    // Description
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 6,
      description: 'Detailed professional background'
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Professional headshot'
    }),

    // Professional Info
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Areas of expertise (e.g., "Sports Injuries", "Chronic Pain")'
    }),
    defineField({
      name: 'qualifications',
      title: 'Qualifications',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Degrees, credentials (e.g., "MD", "PhD in Traditional Medicine")'
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications & Licenses',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Professional licenses and certifications'
    }),
    defineField({
      name: 'awards',
      title: 'Awards & Recognition',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'yearsExperience',
      title: 'Years of Experience',
      type: 'number',
      description: 'Total years in practice'
    }),
    defineField({
      name: 'languages',
      title: 'Languages Spoken',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Languages for patient communication'
    }),

    // Contact Information
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string'
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.email()
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url'
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Booking/Appointment URL',
      type: 'url',
      description: 'Direct link to booking system (Calendly, etc.)'
    }),

    // Relationships
    defineField({
      name: 'linkedBusinesses',
      title: 'Works At (Businesses)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'business' }] }],
      description: 'Clinics, practices, or businesses where this provider works'
    }),

    // Social Links
    defineField({
      name: 'socialLinks',
      title: 'Social Media',
      type: 'object',
      fields: [
        { name: 'facebook', type: 'url', title: 'Facebook' },
        { name: 'twitter', type: 'url', title: 'Twitter' },
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
        { name: 'instagram', type: 'url', title: 'Instagram' }
      ]
    }),

    // Company Info (for corporate providers)
    defineField({
      name: 'founded',
      title: 'Founded/Practicing Since',
      type: 'string',
      description: 'e.g., "2015" or "Since 2010"'
    }),
    defineField({
      name: 'employees',
      title: 'Team Size',
      type: 'string',
      description: 'e.g., "Solo Practice" or "5-10 staff"'
    }),

    // Taxonomy
    defineField({
      name: 'category',
      title: 'Primary Category',
      type: 'reference',
      to: [{ type: 'category' }]
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
      title: 'Featured Provider',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'verified',
      title: 'Verified',
      type: 'boolean',
      initialValue: false,
      description: 'Show verified badge (credentials confirmed)'
    }),
    defineField({
      name: 'claimedBy',
      title: 'Claimed By User',
      type: 'string',
      description: 'User ID who claimed this profile (for Phase 2)'
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'tagline',
      media: 'photo',
      verified: 'verified'
    },
    prepare(selection) {
      const { title, subtitle, media, verified } = selection
      return {
        title: verified ? `✓ ${title}` : title,
        subtitle,
        media
      }
    }
  }
})
