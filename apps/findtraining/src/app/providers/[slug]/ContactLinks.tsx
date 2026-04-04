'use client'

import { Mail, Phone, Globe, ExternalLink } from 'lucide-react'

interface ContactLinksProps {
  providerId: string
  email: string | null
  phone: string | null
  website: string | null
}

async function trackClick(providerId: string, clickType: 'email' | 'phone' | 'website') {
  try {
    await fetch('/api/contact-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: providerId, click_type: clickType }),
    })
  } catch {
    // Non-blocking
  }
}

export function ContactLinks({ providerId, email, phone, website }: ContactLinksProps) {
  return (
    <ul className="space-y-2">
      {email && (
        <li>
          <a
            href={`mailto:${email}`}
            onClick={() => trackClick(providerId, 'email')}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#0F6FEC] transition-colors group"
          >
            <Mail className="w-4 h-4 text-gray-400 group-hover:text-[#0F6FEC] flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{email}</span>
          </a>
        </li>
      )}
      {phone && (
        <li>
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            onClick={() => trackClick(providerId, 'phone')}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#0F6FEC] transition-colors group"
          >
            <Phone className="w-4 h-4 text-gray-400 group-hover:text-[#0F6FEC] flex-shrink-0" aria-hidden="true" />
            <span>{phone}</span>
          </a>
        </li>
      )}
      {website && (
        <li>
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            onClick={() => trackClick(providerId, 'website')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#0F6FEC] transition-colors group"
          >
            <Globe className="w-4 h-4 text-gray-400 group-hover:text-[#0F6FEC] flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{website.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" aria-hidden="true" />
          </a>
        </li>
      )}
    </ul>
  )
}
