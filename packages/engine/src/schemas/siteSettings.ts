import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteId',
      title: 'Site ID',
      type: 'string',
      description: 'Unique identifier for this site (e.g., etomite-org)',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description: 'Display name of the site',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short description or slogan'
    }),
    defineField({
      name: 'logo',
      title: 'Logo URL',
      type: 'string',
      description: 'Direct URL to logo image'
    }),
    defineField({
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'string',
      description: 'Hex color code (e.g., #3B82F6)',
      initialValue: '#3B82F6'
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'string',
      description: 'Hex color code for accents',
      initialValue: '#8B5CF6'
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: Rule => Rule.email()
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'twitter', type: 'url', title: 'Twitter' },
        { name: 'facebook', type: 'url', title: 'Facebook' },
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
        { name: 'instagram', type: 'url', title: 'Instagram' }
      ]
    }),

    // NEW: Content Types Configuration
    defineField({
      name: 'contentTypes',
      title: 'Content Types Configuration',
      type: 'object',
      description: 'Configure which directory types are enabled and customize their labels',
      fields: [
        {
          name: 'software',
          title: 'Software Directory',
          type: 'object',
          fields: [
            { name: 'enabled', type: 'boolean', title: 'Enabled', initialValue: false },
            { name: 'label', type: 'string', title: 'Plural Label', initialValue: 'Software' },
            { name: 'singularLabel', type: 'string', title: 'Singular Label', initialValue: 'Software' },
            { name: 'route', type: 'string', title: 'Route', initialValue: '/software' }
          ]
        },
        {
          name: 'business',
          title: 'Business Directory',
          type: 'object',
          fields: [
            { name: 'enabled', type: 'boolean', title: 'Enabled', initialValue: false },
            { name: 'label', type: 'string', title: 'Plural Label', initialValue: 'Businesses', description: 'e.g., "Clinics", "Agencies"' },
            { name: 'singularLabel', type: 'string', title: 'Singular Label', initialValue: 'Business' },
            { name: 'route', type: 'string', title: 'Route', initialValue: '/business' }
          ]
        },
        {
          name: 'provider',
          title: 'Provider Directory',
          type: 'object',
          fields: [
            { name: 'enabled', type: 'boolean', title: 'Enabled', initialValue: false },
            { name: 'label', type: 'string', title: 'Plural Label', initialValue: 'Practitioners', description: 'e.g., "Doctors", "Tutors", "Agents"' },
            { name: 'singularLabel', type: 'string', title: 'Singular Label', initialValue: 'Practitioner' },
            { name: 'route', type: 'string', title: 'Route', initialValue: '/practitioners' },
            { name: 'allowSelfSignup', type: 'boolean', title: 'Allow Self-Signup', initialValue: false, description: 'Phase 2: Allow providers to register' }
          ]
        },
        {
          name: 'service',
          title: 'Service Directory',
          type: 'object',
          fields: [
            { name: 'enabled', type: 'boolean', title: 'Enabled', initialValue: false },
            { name: 'label', type: 'string', title: 'Plural Label', initialValue: 'Services' },
            { name: 'singularLabel', type: 'string', title: 'Singular Label', initialValue: 'Service' },
            { name: 'route', type: 'string', title: 'Route', initialValue: '/services' }
          ]
        }
      ],
      initialValue: {
        software: { enabled: false, label: 'Software', singularLabel: 'Software', route: '/software' },
        business: { enabled: false, label: 'Businesses', singularLabel: 'Business', route: '/business' },
        provider: { enabled: false, label: 'Practitioners', singularLabel: 'Practitioner', route: '/practitioners', allowSelfSignup: false },
        service: { enabled: false, label: 'Services', singularLabel: 'Service', route: '/services' }
      }
    }),

    // Legacy: Keep for backward compatibility
    defineField({
      name: 'enabledModules',
      title: 'Enabled Modules (Legacy)',
      type: 'object',
      description: '⚠️ DEPRECATED: Use "Content Types Configuration" above instead',
      fields: [
        { name: 'directory', type: 'boolean', title: 'Directory (Software)', initialValue: true },
        { name: 'business', type: 'boolean', title: 'Business Directory', initialValue: false },
        { name: 'blog', type: 'boolean', title: 'Blog/Articles', initialValue: true },
        { name: 'team', type: 'boolean', title: 'Team Members', initialValue: true },
        { name: 'events', type: 'boolean', title: 'Events', initialValue: true }
      ]
    })
  ],
  preview: {
    select: {
      title: 'siteName',
      subtitle: 'siteId'
    }
  }
})
