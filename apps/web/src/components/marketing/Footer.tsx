import Link from 'next/link'

interface FooterLink {
  href: string
  label: string
  external?: boolean
}

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { href: '/features', label: 'Features' },
    { href: '/templates', label: 'Templates' },
    { href: '/pricing', label: 'Pricing' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/founding-members', label: 'Founding Members' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
  Support: [
    { href: '/help', label: 'Help Center' },
    { href: 'mailto:hello@webvillage.com', label: 'Email Us', external: true },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 font-semibold text-white">{category}</h4>
              <ul className="space-y-2 text-gray-400">
                {links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        className="transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} WebVillage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
