export interface Section {
  type: 'h2' | 'h3' | 'p' | 'ul' | 'callout'
  text?: string
  items?: string[]
}

export interface ResourceArticle {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingTimeMinutes: number
  category: string
  content: Section[]
}

export const articles: ResourceArticle[] = [
  {
    slug: 'what-is-hrd-corp-levy',
    title: 'What Is the HRD Corp Levy? A Guide for Malaysian Employers',
    description:
      'Everything Malaysian employers need to know about the HRD Corp levy — who pays it, how much, and how to use it for training.',
    publishedAt: '2026-03-01',
    readingTimeMinutes: 5,
    category: 'HR Compliance',
    content: [
      {
        type: 'p',
        text: 'If you run a business in Malaysia with ten or more employees, you are almost certainly required to contribute to the HRD Corp levy every month. Yet many employers either do not know this obligation exists, or they pay in without ever claiming the funds back for training. This guide covers everything you need to know.',
      },
      {
        type: 'h2',
        text: 'What is HRD Corp?',
      },
      {
        type: 'p',
        text: 'HRD Corp — officially known as the Human Resource Development Corporation, or Perbadanan Pembangunan Sumber Manusia Berhad (PSMB) — is the national statutory body in Malaysia responsible for the development of human capital in the private sector. It was formerly known as HRDF (Human Resource Development Fund). The rebrand to HRD Corp happened in 2021, but "HRDF" is still widely used and refers to the same body and the same levy system.',
      },
      {
        type: 'p',
        text: 'HRD Corp operates under the Ministry of Human Resources (KESUMA) and administers the Human Resources Development (HRD) levy. Its mandate is to ensure that Malaysia\'s workforce is continuously upskilled to meet industry needs.',
      },
      {
        type: 'h2',
        text: 'Who must pay the levy?',
      },
      {
        type: 'p',
        text: 'The levy is mandatory for employers in covered sectors who have ten or more Malaysian employees. The covered sectors are defined in the Second Schedule of the Pembangunan Sumber Manusia Berhad Act 2001, and they span most of the formal economy — including manufacturing, services, mining, construction, and retail.',
      },
      {
        type: 'ul',
        items: [
          '10 or more Malaysian employees → 1% levy on monthly wages',
          '5 to 9 Malaysian employees → voluntary registration (0.5% levy)',
          'Fewer than 5 employees → not required to register',
          'Expatriate employees are excluded from the levy calculation',
        ],
      },
      {
        type: 'callout',
        text: 'Tip: If you have between 5 and 9 employees, voluntary registration is often worth it — you get full access to HRDF-claimable training at a lower contribution rate.',
      },
      {
        type: 'h2',
        text: 'How is the levy calculated?',
      },
      {
        type: 'p',
        text: 'The calculation is straightforward: 1% of total monthly wages paid to Malaysian employees. This includes basic salary, allowances, and bonuses — but excludes overtime, service charges, and reimbursements.',
      },
      {
        type: 'p',
        text: 'For example: if your total monthly payroll for Malaysian employees is RM 50,000, your monthly levy contribution is RM 500. Contributions must be paid to HRD Corp by the 15th of the following month via the eTRiS (e-Training Information System) portal.',
      },
      {
        type: 'h2',
        text: 'What can you claim?',
      },
      {
        type: 'p',
        text: 'Your accumulated levy balance can be used to fund training for your employees — but only with HRDF-registered training providers offering approved courses. You cannot claim for internal training, ad hoc workshops from unregistered providers, or overseas training (with limited exceptions).',
      },
      {
        type: 'ul',
        items: [
          'Courses from HRDF-registered training providers',
          'E-learning programmes approved by HRD Corp',
          'Apprenticeship and structured on-the-job training schemes',
          'Competency-based training under NOSS frameworks',
          'Recognised overseas certifications (with prior approval)',
        ],
      },
      {
        type: 'h2',
        text: 'How to make a claim',
      },
      {
        type: 'p',
        text: 'Claims are processed through the eTRiS portal at etris.hrdcorp.gov.my. Your company\'s HR manager (or an appointed Training Coordinator) handles this. The general process is:',
      },
      {
        type: 'ul',
        items: [
          'Step 1: Log in to eTRiS and verify your levy balance',
          'Step 2: Browse available schemes (SBL-Khas, SBL, IBL, etc.) to find the right claim type',
          'Step 3: Identify an HRDF-registered provider and confirm the course is claimable',
          'Step 4: Submit your claim before the training starts (some schemes require pre-approval)',
          'Step 5: Upload supporting documents after training — attendance sheets, invoice, and completion certificate',
          'Step 6: Wait for HRD Corp approval, then payment is transferred directly to the training provider',
        ],
      },
      {
        type: 'h2',
        text: 'Common mistakes employers make',
      },
      {
        type: 'ul',
        items: [
          'Not registering with HRD Corp after reaching 10 employees (penalties apply)',
          'Missing the monthly payment deadline of the 15th',
          'Leaving levy balances unclaimed for years — accumulated balances can expire',
          'Booking training with unregistered providers and assuming it is claimable',
          'Failing to submit claims before training starts when pre-approval is required',
          'Not appointing a dedicated Training Coordinator in the company',
        ],
      },
      {
        type: 'callout',
        text: 'Many Malaysian employers are sitting on thousands of ringgit in unclaimed levy. Check your eTRiS balance today — your employees deserve that training.',
      },
      {
        type: 'h2',
        text: 'Find HRD Corp registered training providers',
      },
      {
        type: 'p',
        text: 'FindTraining.com indexes every HRDF-registered training provider in Malaysia so you can find claimable courses faster than the eTRiS portal allows. Search by category, state, or delivery method.',
      },
    ],
  },
  {
    slug: 'how-to-find-hrdf-training-provider',
    title: 'How to Find an HRDF-Registered Training Provider in Malaysia',
    description:
      'Step-by-step guide to finding and vetting HRDF-registered training providers in Malaysia for levy-claimable courses.',
    publishedAt: '2026-03-08',
    readingTimeMinutes: 4,
    category: 'Training Guide',
    content: [
      {
        type: 'p',
        text: 'Finding the right HRDF-registered training provider sounds simple — until you open the eTRiS portal. Between the limited search filters, outdated listings, and the absence of any comparison or review features, what should be a ten-minute task often turns into an afternoon of calls and emails. Here is a better approach.',
      },
      {
        type: 'h2',
        text: 'Why provider registration matters',
      },
      {
        type: 'p',
        text: 'Only training providers who are officially registered with HRD Corp can deliver courses that qualify for levy claims. If you book training with an unregistered provider — even a well-regarded one — your company cannot recover the cost from your HRD Corp levy account. Registration is non-negotiable.',
      },
      {
        type: 'p',
        text: 'Registration also provides a baseline of quality assurance. HRD Corp requires providers to meet minimum standards for their trainers, course materials, and programme delivery before granting registration. It is not a perfect filter, but it weeds out the least credible operators.',
      },
      {
        type: 'h2',
        text: 'The problem with eTRiS',
      },
      {
        type: 'p',
        text: 'The official eTRiS portal (etris.hrdcorp.gov.my) is the authoritative source of registered providers, but it is built for compliance administration — not discovery. Common frustrations HR managers face:',
      },
      {
        type: 'ul',
        items: [
          'Search returns hundreds of results with no quality sorting',
          'Provider profiles are sparse — often just a company name and registration number',
          'No filtering by delivery method (in-person vs. virtual vs. e-learning)',
          'No course catalogue — you cannot see what a provider actually teaches',
          'No reviews or ratings from other employers',
          'Mobile experience is unusable',
        ],
      },
      {
        type: 'h2',
        text: 'How FindTraining makes it easier',
      },
      {
        type: 'p',
        text: 'FindTraining.com is built specifically for the discovery problem. Every provider in our directory is cross-referenced against the HRD Corp registry, so you can be confident that any provider you find here is legitimately registered for levy claims.',
      },
      {
        type: 'ul',
        items: [
          'Filter by category — IT, leadership, compliance, safety, language, and more',
          'Filter by state — find providers near your office or your employees',
          'Filter by delivery method — in-person, virtual classroom, or e-learning',
          'View full company profiles with descriptions and contact details',
          'Shortlist providers and compare them side by side',
        ],
      },
      {
        type: 'h2',
        text: 'What to look for in a training provider',
      },
      {
        type: 'p',
        text: 'Once you have a shortlist of HRDF-registered providers, use these criteria to evaluate them:',
      },
      {
        type: 'ul',
        items: [
          'Active HRD Corp registration status — confirm it has not lapsed',
          'Breadth of course catalogue — can they serve multiple departments?',
          'Delivery flexibility — do they offer in-house delivery for your team?',
          'Trainer credentials — are the trainers certified practitioners or academics?',
          'Post-training support — do participants get materials, follow-up access, or certification?',
          'Client references — can they provide case studies or testimonials from similar companies?',
        ],
      },
      {
        type: 'h2',
        text: 'Questions to ask before booking',
      },
      {
        type: 'callout',
        text: 'Always confirm levy eligibility before signing any agreement. Even a registered provider can run non-claimable courses.',
      },
      {
        type: 'ul',
        items: [
          '"Is this specific course approved under HRD Corp — and which scheme (SBL, SBL-Khas, etc.)?"',
          '"What is the maximum claimable amount per participant?"',
          '"Does the course require HRD Corp pre-approval before we start?"',
          '"What documentation will you provide for our eTRiS claim submission?"',
          '"What is your typical class size, and do you offer private group delivery?"',
          '"What happens if a participant needs to cancel?"',
        ],
      },
      {
        type: 'h2',
        text: 'Browse all HRDF-registered training providers',
      },
      {
        type: 'p',
        text: 'Stop guessing and start comparing. FindTraining.com lists all HRDF-registered training providers in Malaysia — searchable by category, state, and delivery method.',
      },
    ],
  },
  {
    slug: 'best-it-training-providers-malaysia-2026',
    title: 'Best IT Training Providers in Malaysia 2026 (HRDF-Claimable)',
    description:
      'Top IT and technology training providers in Malaysia with HRD Corp registration — all eligible for levy claims in 2026.',
    publishedAt: '2026-03-15',
    readingTimeMinutes: 6,
    category: 'Training Guide',
    content: [
      {
        type: 'p',
        text: 'Technology training is now the single largest category of HRDF levy claims in Malaysia. As companies race to upskill employees in cloud computing, data analytics, cybersecurity, and AI, the demand for HRD Corp-registered IT training providers has never been higher. This guide helps HR and L&D managers find the right providers — and make the most of their levy budget.',
      },
      {
        type: 'h2',
        text: 'Why IT training is the fastest-growing HRDF category',
      },
      {
        type: 'p',
        text: 'The Malaysian government has made digital economy transformation a centrepiece of its economic strategy, and the training market reflects this. HRDF levy claims for IT-related courses have grown significantly year on year, driven by:',
      },
      {
        type: 'ul',
        items: [
          'Mandatory digital upskilling requirements in banking, insurance, and financial services',
          'Government incentives tied to MyDigital initiative milestones',
          'The rapid adoption of cloud infrastructure across sectors',
          'Growing demand for data literacy at every level of the workforce',
          'Cybersecurity requirements under PDPA compliance programmes',
        ],
      },
      {
        type: 'h2',
        text: 'What to look for in an IT training provider',
      },
      {
        type: 'p',
        text: 'IT training has a much wider quality range than other HRDF categories. A compliance training provider can often rely on standardised content, but IT training needs to stay current with fast-moving vendor ecosystems. Key quality signals:',
      },
      {
        type: 'ul',
        items: [
          'Vendor-authorised status — are they an official Microsoft, AWS, Google, or Cisco training partner?',
          'Certification pass rates — do they publish average pass rates for exams like Azure, CISSP, or CompTIA?',
          'Trainer credentials — do trainers hold current certifications in the subjects they teach?',
          'Lab environments — do students get hands-on access to real cloud or lab environments, not just slides?',
          'Content freshness — when was the course last updated? AI and cloud content goes stale quickly.',
        ],
      },
      {
        type: 'h2',
        text: 'Featured training categories and what to expect',
      },
      {
        type: 'h3',
        text: 'Cybersecurity',
      },
      {
        type: 'p',
        text: 'Cybersecurity is now a board-level concern, and HRDF levy claims for security training have risen sharply following PDPA enforcement and Bank Negara cybersecurity guidelines. Look for providers offering CompTIA Security+, Certified Ethical Hacker (CEH), CISSP, or ISO 27001 lead implementer courses. The best providers run simulated attack environments ("cyber ranges") rather than classroom theory alone.',
      },
      {
        type: 'h3',
        text: 'Cloud Computing',
      },
      {
        type: 'p',
        text: 'Microsoft Azure, Amazon Web Services, and Google Cloud Platform certifications are in high demand across all sectors. Prioritise providers who are official authorised training partners (ATPs) for these platforms — this ensures content is current, trainers are certified, and exam vouchers are included. AWS Certified Solutions Architect and Azure Administrator AZ-104 are the most-claimed courses in this category.',
      },
      {
        type: 'h3',
        text: 'Data Analytics',
      },
      {
        type: 'p',
        text: 'Power BI, Python for data analysis, SQL, and Tableau courses are popular choices for organisations building data literacy across non-technical teams. The best providers tailor content to industry-specific use cases — a bank has different data questions than a logistics company. Look for providers who offer post-training project work or mentoring.',
      },
      {
        type: 'h3',
        text: 'Software Development',
      },
      {
        type: 'p',
        text: 'Web development, DevOps, and agile delivery training are common for organisations building or modernising their tech teams. Look for providers who use real project-based learning rather than passive instruction — developers learn best by building things, not watching slides.',
      },
      {
        type: 'h2',
        text: 'How to evaluate an IT training provider before booking',
      },
      {
        type: 'ul',
        items: [
          'Check their HRD Corp registration status is current — not expired',
          'Ask for a sample course outline to verify content depth and currency',
          'Request trainer CVs or LinkedIn profiles to confirm active certifications',
          'Ask whether the course includes practical labs, not just theoretical instruction',
          'Confirm exam vouchers are included if you are aiming for a vendor certification',
          'Ask for references from companies in your industry who have completed the course',
        ],
      },
      {
        type: 'h2',
        text: 'How to maximise your levy for IT training',
      },
      {
        type: 'callout',
        text: 'Plan your IT training calendar at least 12 months ahead. HRD Corp levy balances can lapse — use them intentionally rather than scrambling at year end.',
      },
      {
        type: 'ul',
        items: [
          'Plan a 12-month training roadmap at the start of the financial year to avoid end-of-year scrambles',
          'Batch employees into group cohorts to reduce per-head cost and increase levy efficiency',
          'Use the SBL-Khas scheme where possible — it offers higher claim limits for strategic courses',
          'Stack certifications: foundation → associate → professional (e.g. AZ-900 → AZ-104 → AZ-305)',
          'Negotiate in-house delivery for teams of 8 or more — most IT providers offer this and it reduces levy spend per participant',
          'Keep records meticulously: attendance, invoice, and certificate — HRD Corp audits are real',
        ],
      },
      {
        type: 'h2',
        text: 'Find IT training providers in Malaysia',
      },
      {
        type: 'p',
        text: 'Browse IT and technology training providers on FindTraining.com — all HRDF-registered, all eligible for levy claims. Filter by certification type, delivery method, and state.',
      },
    ],
  },
]

export function getArticleBySlug(slug: string): ResourceArticle | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug)
}
