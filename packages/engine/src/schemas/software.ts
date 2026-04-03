import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'software',
  title: 'Software',
  type: 'document',
  fields: [
    // Core
    defineField({
      name: 'title',
      title: 'Software Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required()
    }),
    
    // Content
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4
    }),
    defineField({
      name: 'excerpt',
      title: 'Short Description',
      type: 'string'
    }),
    defineField({
      name: 'body',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    
    // Software-specific
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'screenshot',
      title: 'Screenshot',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image' }]
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'object',
      fields: [
        { name: 'free', title: 'Free Tier', type: 'boolean' },
        { name: 'startingPrice', title: 'Starting Price', type: 'number' },
        { name: 'currency', title: 'Currency', type: 'string' },
        { name: 'pricingModel', title: 'Pricing Model', type: 'string' }
      ]
    }),
    
    // Links
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url'
    }),
    defineField({
      name: 'documentation',
      title: 'Documentation URL',
      type: 'url'
    }),
    defineField({
      name: 'demo',
      title: 'Demo URL',
      type: 'url'
    }),
    defineField({
      name: 'github',
      title: 'GitHub URL',
      type: 'url'
    }),
    
    // Taxonomy
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }]
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }]
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
      type: 'text'
    }),
    
    // Meta
    defineField({
      name: 'siteId',
      title: 'Site ID',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'originalUrl',
      title: 'Original WordPress URL',
      type: 'url'
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false
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
      title: 'title',
      media: 'logo',
      rating: 'rating',
      reviewCount: 'reviewCount',
      excerpt: 'excerpt'
    },
    prepare(selection) {
      const { title, media, rating, reviewCount, excerpt } = selection
      const ratingDisplay = rating > 0
        ? `${rating.toFixed(1)}★ (${reviewCount} reviews)`
        : 'No reviews yet'
      return {
        title,
        subtitle: `${ratingDisplay} • ${excerpt || ''}`,
        media
      }
    }
  }
})
