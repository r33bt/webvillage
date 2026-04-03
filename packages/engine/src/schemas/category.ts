import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji or icon code'
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Hex color code (e.g., #3B82F6)'
    }),
    defineField({
      name: 'type',
      title: 'Category Type',
      type: 'string',
      options: {
        list: [
          { title: 'Software', value: 'software' },
          { title: 'Business', value: 'business' },
          { title: 'Provider', value: 'provider' },
          { title: 'Service', value: 'service' },
          { title: 'Article', value: 'article' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }]
    }),
    defineField({
      name: 'siteId',
      title: 'Site ID',
      type: 'string',
      description: 'Leave empty for global categories'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', type: 'string', title: 'Meta Title' },
        { name: 'metaDescription', type: 'text', title: 'Meta Description', rows: 3 }
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon',
      type: 'type'
    },
    prepare(selection) {
      const { title, icon, type } = selection
      return {
        title: `${icon || '📁'} ${title}`,
        subtitle: type
      }
    }
  }
})
