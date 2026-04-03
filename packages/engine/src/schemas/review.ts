import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'review',
  title: 'Reviews',
  type: 'document',
  fields: [
    defineField({
      name: 'listing',
      title: 'Listing',
      type: 'reference',
      to: [
        { type: 'software' },
        { type: 'business' },
        { type: 'provider' },
        { type: 'service' }
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'listingType',
      title: 'Listing Type',
      type: 'string',
      options: {
        list: ['software', 'business', 'provider', 'service']
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5)
    }),
    defineField({
      name: 'title',
      title: 'Review Title',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(100)
    }),
    defineField({
      name: 'text',
      title: 'Review Text',
      type: 'text',
      validation: Rule => Rule.required().min(50).max(2000)
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'authorEmail',
      title: 'Author Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Published', value: 'published' },
          { title: 'Rejected', value: 'rejected' }
        ]
      },
      initialValue: 'pending',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    }),
    defineField({
      name: 'verified',
      title: 'Verified Purchase',
      type: 'boolean',
      description: 'Review verified through completed booking',
      initialValue: false
    }),
    defineField({
      name: 'bookingId',
      title: 'Booking ID',
      type: 'string',
      description: 'Associated booking UUID for verified reviews',
      hidden: ({ document }) => !document?.verified
    }),
    defineField({
      name: 'helpfulCount',
      title: 'Helpful Count',
      type: 'number',
      description: 'Net helpful votes (upvotes - downvotes)',
      initialValue: 0
    }),
    defineField({
      name: 'helpfulVotes',
      title: 'Helpful Votes',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'userEmail', type: 'string', title: 'User Email' },
          { name: 'vote', type: 'string', title: 'Vote', options: { list: ['helpful', 'not_helpful'] } },
          { name: 'votedAt', type: 'datetime', title: 'Voted At' }
        ]
      }]
    }),
    defineField({
      name: 'flagged',
      title: 'Flagged',
      type: 'boolean',
      description: 'Review flagged for moderation',
      initialValue: false
    }),
    defineField({
      name: 'flags',
      title: 'Flags',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'reporterEmail', type: 'string', title: 'Reporter Email' },
          { name: 'reason', type: 'string', title: 'Reason', options: { list: ['spam', 'inappropriate', 'fake', 'offensive', 'other'] } },
          { name: 'details', type: 'text', title: 'Details' },
          { name: 'reportedAt', type: 'datetime', title: 'Reported At' }
        ]
      }],
      hidden: ({ document }) => !document?.flagged
    }),
    defineField({
      name: 'providerResponse',
      title: 'Provider Response',
      type: 'object',
      fields: [
        { name: 'text', type: 'text', title: 'Response Text', validation: Rule => Rule.max(1000) },
        { name: 'respondedBy', type: 'string', title: 'Responded By' },
        { name: 'respondedAt', type: 'datetime', title: 'Responded At' }
      ]
    }),
    defineField({
      name: 'moderationNotes',
      title: 'Moderation Notes',
      type: 'text',
      description: 'Internal admin notes'
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      readOnly: true
    })
  ],
  preview: {
    select: {
      title: 'title',
      rating: 'rating',
      author: 'authorName',
      status: 'status',
      type: 'listingType',
      verified: 'verified'
    },
    prepare({ title, rating, author, status, type, verified }) {
      return {
        title: title,
        subtitle: `${rating}★ by ${author} - ${status} (${type})${verified ? ' ✓' : ''}`
      }
    }
  }
})
