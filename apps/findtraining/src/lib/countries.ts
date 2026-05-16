// FindTraining — Country configuration
// Drives all country hub pages (/my, /sg, /gb, /au, /us)
// Each config is the single source of truth for that country's content.

export type RegulatoryBody = {
  name: string
  shortName: string
  acronym: string
  website: string
  levyName: string
  levyExplainer: string
}

export type CountryTool = {
  label: string
  href: string
  description: string
}

export type FAQ = {
  q: string
  a: string
}

export type CountryConfig = {
  code: string
  slug: string
  name: string
  flag: string
  currency: string
  heroHeadline: string
  heroSubline: string
  regulatoryBody: RegulatoryBody | null
  tools: CountryTool[]
  howItWorksStep3: { title: string; body: string }
  faqs: FAQ[]
  pricingCTA: { currency: string; starterRange: string }
  hasStateData: boolean
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  MY: {
    code: 'MY',
    slug: 'my',
    name: 'Malaysia',
    flag: '🇲🇾',
    currency: 'RM',
    heroHeadline: 'Find HRDF-Registered Training Providers in Malaysia',
    heroSubline:
      'Browse levy-claimable courses, certifications, and professional development programmes across all 16 states.',
    regulatoryBody: {
      name: 'Human Resource Development Corporation',
      shortName: 'HRD Corp',
      acronym: 'HRDF',
      website: 'https://www.hrdcorp.gov.my',
      levyName: 'HRDF levy',
      levyExplainer:
        'Malaysian employers in covered sectors pay a monthly levy of 1% of wages into the HRD Corp fund. This levy can be claimed back to fund HRDF-registered training programmes — at no net cost to your company.',
    },
    tools: [
      {
        label: 'HRDF Levy Calculator',
        href: '/tools/hrdf-calculator',
        description: 'Calculate your monthly levy contribution based on headcount and salaries',
      },
      {
        label: 'HRDF Eligibility Checker',
        href: '/tools/hrdf-eligibility',
        description: 'Check if your company qualifies for HRD Corp levy claims',
      },
    ],
    howItWorksStep3: {
      title: 'Claim Your Levy',
      body: 'Submit your HRD Corp grant application on eTRiS before training starts and recover up to 100% of your training cost.',
    },
    faqs: [
      {
        q: 'What is HRD Corp and the HRDF levy?',
        a: "HRD Corp (formerly HRDF) is Malaysia's Human Resources Development Corporation. Employers in covered sectors pay a monthly levy of 1% of employee wages into the HRD Corp fund, which can be claimed back for registered training programmes.",
      },
      {
        q: 'How do I find HRDF-registered training providers?',
        a: 'Search FindTraining by category, state, or keyword. Every Malaysian listing on this page is cross-referenced against the official HRD Corp registry.',
      },
      {
        q: 'How do I claim my HRD Corp levy?',
        a: "Log in to eTRiS (HRD Corp's portal), select your training provider and course, and submit a claim before training starts. Claims must be submitted in advance — retrospective claims are not accepted.",
      },
      {
        q: 'How much is the HRDF levy, and can I claim it all back?',
        a: "The levy is 1% of your employees' monthly wages. You can claim back up to the full amount you have accumulated in the fund, depending on training cost and your current balance.",
      },
      {
        q: 'Can I list my training company on FindTraining?',
        a: "If your company is registered with HRD Corp, you are already listed. Claim your profile to add contact details, courses, and a company description. Visit our founding member page for early access pricing.",
      },
    ],
    pricingCTA: { currency: 'RM', starterRange: '200–300/mo' },
    hasStateData: true,
  },

  SG: {
    code: 'SG',
    slug: 'sg',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'S$',
    heroHeadline: 'Find Training Providers in Singapore',
    heroSubline:
      'Discover SkillsFuture-eligible courses and professional development programmes from accredited Singapore training providers.',
    regulatoryBody: {
      name: 'SkillsFuture Singapore',
      shortName: 'SSG',
      acronym: 'SSG',
      website: 'https://www.skillsfuture.gov.sg',
      levyName: 'SkillsFuture Credit',
      levyExplainer:
        'Singapore Citizens aged 25 and above receive SkillsFuture Credit that can be used to offset the cost of approved training programmes. Additional top-ups are available for mid-career workers.',
    },
    tools: [],
    howItWorksStep3: {
      title: 'Apply for SkillsFuture Credit',
      body: 'Log in to MySkillsFuture.sg with your Singpass and claim your credit to offset course fees at approved providers.',
    },
    faqs: [
      {
        q: 'What is SkillsFuture Credit?',
        a: "SkillsFuture Credit is a government initiative giving Singapore Citizens aged 25 and above credit to spend on approved training courses. It can be used on top of other available subsidies.",
      },
      {
        q: 'How do I use my SkillsFuture Credit?',
        a: 'Log in to MySkillsFuture.sg with your Singpass, find your course, and submit a credit claim. The credit is deducted from your balance and paid directly to the provider.',
      },
      {
        q: 'Are all providers on this page SSG-accredited?',
        a: 'Providers listed here are sourced from SSG-accredited training data. Always verify course eligibility on the official MySkillsFuture portal before enrolling.',
      },
    ],
    pricingCTA: { currency: 'S$', starterRange: '90–130/mo' },
    hasStateData: false,
  },

  GB: {
    code: 'GB',
    slug: 'gb',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: '£',
    heroHeadline: 'Find Sales Training Providers in the United Kingdom',
    heroSubline:
      'Browse ISP-accredited and apprenticeship-approved sales training providers across England, Scotland, Wales, and Northern Ireland.',
    regulatoryBody: {
      name: 'Institute of Sales Professionals',
      shortName: 'ISP',
      acronym: 'ISP',
      website: 'https://www.ismprofessional.org',
      levyName: 'Apprenticeship Levy',
      levyExplainer:
        'UK employers with a payroll over £3 million pay a 0.5% Apprenticeship Levy. This can fund apprenticeship training — including the Level 4 Sales Executive standard — via providers on the Register of Apprenticeship Training Providers (RoATP).',
    },
    tools: [],
    howItWorksStep3: {
      title: 'Fund via Apprenticeship Levy',
      body: "Eligible employers can use their Apprenticeship Levy balance to fund Level 4 Sales Executive training. Access your account via the Apprenticeship Service on GOV.UK.",
    },
    faqs: [
      {
        q: 'What is the Apprenticeship Levy?',
        a: 'UK employers with annual payroll over £3 million pay a 0.5% levy into a digital account. This can be used to pay for apprenticeship training from approved providers on the RoATP.',
      },
      {
        q: 'What is the ISP?',
        a: "The Institute of Sales Professionals (ISP) is the UK's professional body for sales. ISP-accredited providers meet rigorous quality standards for sales training and development.",
      },
      {
        q: 'What is the Level 4 Sales Executive apprenticeship?',
        a: 'The Level 4 Sales Executive is an approved apprenticeship standard for B2B and B2C sales roles, delivered by providers on the Register of Apprenticeship Training Providers.',
      },
    ],
    pricingCTA: { currency: '£', starterRange: '80–120/mo' },
    hasStateData: false,
  },

  AU: {
    code: 'AU',
    slug: 'au',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'A$',
    heroHeadline: 'Find Training Providers in Australia',
    heroSubline:
      'Browse ASQA-registered training organisations (RTOs) and accredited professional development providers across Australia.',
    regulatoryBody: {
      name: 'Australian Skills Quality Authority',
      shortName: 'ASQA',
      acronym: 'ASQA',
      website: 'https://www.asqa.gov.au',
      levyName: 'VET funding',
      levyExplainer:
        "ASQA is Australia's national vocational education and training regulator. Registered Training Organisations (RTOs) listed on training.gov.au are government-approved to deliver nationally accredited qualifications.",
    },
    tools: [],
    howItWorksStep3: {
      title: 'Verify RTO Registration',
      body: 'Check that your chosen provider is listed on training.gov.au before enrolling. Nationally accredited qualifications are only valid from registered RTOs.',
    },
    faqs: [
      {
        q: 'What is an RTO?',
        a: 'A Registered Training Organisation (RTO) is a government-approved provider that delivers nationally accredited qualifications. Registration is granted and monitored by ASQA.',
      },
      {
        q: 'How do I verify an RTO is registered?',
        a: "Search training.gov.au for the provider's name or RTO code. Only providers listed there can issue nationally recognised qualifications.",
      },
      {
        q: 'What government funding is available?',
        a: 'Funding varies by state and territory. Most states offer subsidised training for eligible individuals via Smart and Skilled, Skills First, or equivalent programs. Check your state training authority for current rates.',
      },
    ],
    pricingCTA: { currency: 'A$', starterRange: '120–180/mo' },
    hasStateData: false,
  },

  US: {
    code: 'US',
    slug: 'us',
    name: 'United States',
    flag: '🇺🇸',
    currency: '$',
    heroHeadline: 'Find Sales Training Providers in the United States',
    heroSubline:
      'Browse top sales training organisations, Sandler franchises, and professional development providers across the US.',
    regulatoryBody: null,
    tools: [],
    howItWorksStep3: {
      title: 'Contact the Provider',
      body: 'Reach out directly using the contact details on each profile. US training has no government levy scheme — providers offer direct pricing and custom corporate packages.',
    },
    faqs: [
      {
        q: 'Is there a government training levy in the US?',
        a: "No — the US does not have a national training levy scheme. Training costs are funded directly by employers or individuals, often via corporate L&D budgets.",
      },
      {
        q: 'What is Sandler Training?',
        a: 'Sandler is one of the world\'s largest sales training franchises. Sandler franchisees are independent local operators who deliver the Sandler methodology under licence.',
      },
      {
        q: 'How do I choose a sales training provider?',
        a: 'Look for providers with a proven methodology, verifiable client results, and delivery options that match your team (in-person, virtual, or hybrid). Use the search filters to narrow by category and delivery method.',
      },
    ],
    pricingCTA: { currency: '$', starterRange: '150–250/mo' },
    hasStateData: false,
  },
}

export function getOtherCountries(currentCode: string): CountryConfig[] {
  return Object.values(COUNTRY_CONFIGS).filter((c) => c.code !== currentCode)
}
