'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@webvillage/ui'

const categories = ['All', 'Personal', 'Business', 'Portfolio', 'Creator', 'Blog']

const templates = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'Personal',
    description: 'Clean, professional portfolio with a focus on content',
    color: 'from-slate-100 to-slate-200',
  },
  {
    id: 'consultant',
    name: 'Consultant',
    category: 'Business',
    description: 'Perfect for coaches, consultants, and service providers',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'startup',
    name: 'Startup',
    category: 'Business',
    description: 'Modern SaaS landing page with pricing and features',
    color: 'from-indigo-100 to-indigo-200',
  },
  {
    id: 'creative',
    name: 'Creative',
    category: 'Portfolio',
    description: 'Bold design for artists, photographers, and designers',
    color: 'from-purple-100 to-purple-200',
  },
  {
    id: 'local-business',
    name: 'Local Business',
    category: 'Business',
    description: 'Great for shops, restaurants, and local services',
    color: 'from-green-100 to-green-200',
  },
  {
    id: 'link-in-bio',
    name: 'Link in Bio',
    category: 'Creator',
    description: 'Perfect for social creators — replace Linktree',
    color: 'from-pink-100 to-pink-200',
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    category: 'Portfolio',
    description: 'Showcase your work and attract new clients',
    color: 'from-amber-100 to-amber-200',
  },
  {
    id: 'blogger',
    name: 'Blogger',
    category: 'Blog',
    description: 'Beautiful blog layout with reading-focused design',
    color: 'from-rose-100 to-rose-200',
  },
  {
    id: 'photographer',
    name: 'Photographer',
    category: 'Portfolio',
    description: 'Gallery-focused template for visual portfolios',
    color: 'from-cyan-100 to-cyan-200',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    category: 'Business',
    description: 'Menu display, booking, and contact info',
    color: 'from-orange-100 to-orange-200',
  },
  {
    id: 'personal-brand',
    name: 'Personal Brand',
    category: 'Personal',
    description: 'Build your personal brand with a modern layout',
    color: 'from-teal-100 to-teal-200',
  },
  {
    id: 'podcast',
    name: 'Podcast',
    category: 'Creator',
    description: 'Showcase episodes, guests, and subscribe links',
    color: 'from-violet-100 to-violet-200',
  },
]

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredTemplates =
    activeCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === activeCategory)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 pb-16 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Start with a template
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-indigo-100">
            Choose from 20+ professionally designed templates. Customize
            everything to match your brand.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Templates Grid */}
      <section className="bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                {/* Template Preview Placeholder */}
                <div
                  className={`aspect-[4/3] bg-gradient-to-br ${template.color} flex items-center justify-center`}
                >
                  <span className="text-sm font-medium text-gray-500">
                    {template.name} Preview
                  </span>
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {template.category}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-gray-500">
                    {template.description}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Preview
                    </Button>
                    <Link href="/signup" className="flex-1">
                      <Button size="sm" className="w-full">
                        Use Template
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Can&apos;t find what you need?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            All templates are fully customizable. Pick any template and make it
            your own with custom colors, fonts, and content.
          </p>
          <Link href="/signup">
            <Button size="lg">Start Building Free</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
