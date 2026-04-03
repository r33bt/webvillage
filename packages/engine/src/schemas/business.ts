import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'business',
  title: 'Business',
  type: 'document',
  fields: [
    // Core Identity
    defineField({
      name: 'name',
      title: 'Business Name',
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
      description: 'Short catchy phrase (e.g., "Building Dreams Since 1995")'
    }),

    // Description
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 6,
      description: 'Detailed company overview'
    }),
    defineField({
      name: 'excerpt',
      title: 'Short Description',
      type: 'string',
      description: 'Brief summary for cards/previews (max 160 chars)'
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
      type: 'string'
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url'
    }),

    // Location
    defineField({
      name: 'address',
      title: 'Street Address',
      type: 'string'
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string'
    }),
    defineField({
      name: 'state',
      title: 'State/Province',
      type: 'string'
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      initialValue: 'Malaysia'
    }),
    defineField({
      name: 'zipCode',
      title: 'ZIP/Postal Code',
      type: 'string'
    }),
    defineField({
      name: 'location',
      title: 'Geo Location',
      type: 'geopoint',
      description: 'For map display'
    }),

    // Business Details
    defineField({
      name: 'founded',
      title: 'Year Founded',
      type: 'string',
      description: 'e.g., "1995" or "2020"'
    }),
    defineField({
      name: 'employees',
      title: 'Number of Employees',
      type: 'string',
      description: 'e.g., "50-100" or "500+"'
    }),
    defineField({
      name: 'services',
      title: 'Services Offered',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of services (e.g., "Web Development", "SEO")'
    }),
    defineField({
      name: 'specializations',
      title: 'Specializations',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Areas of expertise'
    }),

    // Operating Information
    defineField({
      name: 'hours',
      title: 'Business Hours',
      type: 'text',
      rows: 3,
      description: 'e.g., "Mon-Fri: 9am-6pm"'
    }),
    defineField({
      name: 'serviceArea',
      title: 'Service Area',
      type: 'string',
      description: 'Geographic areas served (e.g., "Kuala Lumpur & Selangor")'
    }),

    // Credentials
    defineField({
      name: 'certifications',
      title: 'Certifications & Licenses',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Professional certifications'
    }),
    defineField({
      name: 'awards',
      title: 'Awards & Recognition',
      type: 'array',
      of: [{ type: 'string' }]
    }),

    // Pricing
    defineField({
      name: 'priceRange',
      title: 'Price Range',
      type: 'string',
      options: {
        list: [
          { title: '$$ - Budget Friendly', value: '$$' },
          { title: '$$$ - Mid Range', value: '$$$' },
          { title: '$$$$ - Premium', value: '$$$$' },
          { title: '$$$$$ - Luxury', value: '$$$$$' }
        ]
      }
    }),
    defineField({
      name: 'minimumProject',
      title: 'Minimum Project Size',
      type: 'string',
      description: 'e.g., "$5,000" or "No minimum"'
    }),

    // Taxonomy
    defineField({
      name: 'category',
      title: 'Primary Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'categories',
      title: 'Additional Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }]
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    }),

    // Media
    defineField({
      name: 'logo',
      title: 'Company Logo',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Main banner/hero image'
    }),
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      of: [{ 
        type: 'image',
        fields: [
          {
            name: 'caption',
            type: 'string',
            title: 'Caption'
          }
        ]
      }],
      description: 'Project photos, office, team'
    }),

    // Social Proof
    defineField({
      name: 'clientLogos',
      title: 'Client Logos',
      type: 'array',
      of: [{ type: 'image' }],
      description: 'Logos of notable clients'
    }),
    defineField({
      name: 'testimonials',
      title: 'Featured Testimonials',
      type: 'array',
      of: [{ 
        type: 'object',
        fields: [
          { name: 'quote', type: 'text', title: 'Quote' },
          { name: 'author', type: 'string', title: 'Author Name' },
          { name: 'company', type: 'string', title: 'Company' },
          { name: 'position', type: 'string', title: 'Position' }
        ]
      }]
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
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'youtube', type: 'url', title: 'YouTube' }
      ]
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

    // Admin/Meta
    defineField({
      name: 'siteId',
      title: 'Site ID',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'featured',
      title: 'Featured Listing',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'verified',
      title: 'Verified Business',
      type: 'boolean',
      initialValue: false,
      description: 'Show verified badge'
    }),
    defineField({
      name: 'claimedBy',
      title: 'Claimed By User',
      type: 'string',
      description: 'User ID who claimed this listing'
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    }),
    defineField({
      name: 'originalUrl',
      title: 'Original WordPress URL',
      type: 'url',
      description: 'For migration tracking'
    }),

    // Review Metrics
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Average rating from reviews (calculated automatically)',
      validation: Rule => Rule.min(0).max(5).precision(1),
      initialValue: 0,
      readOnly: true
    }),
    defineField({
      name: 'reviewCount',
      title: 'Review Count',
      type: 'number',
      description: 'Total number of published reviews',
      validation: Rule => Rule.min(0).integer(),
      initialValue: 0,
      readOnly: true
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'city',
      media: 'logo',
      rating: 'rating',
      reviewCount: 'reviewCount'
    },
    prepare(selection) {
      const { title, subtitle, media, rating, reviewCount } = selection
      const ratingDisplay = rating > 0
        ? `${rating.toFixed(1)}★ (${reviewCount} reviews)`
        : 'No reviews yet'
      const cityDisplay = subtitle ? ` • ${subtitle}` : ''
      return {
        title,
        subtitle: `${ratingDisplay}${cityDisplay}`,
        media
      }
    }
  }
})
