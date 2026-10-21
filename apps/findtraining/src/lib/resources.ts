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
        text: 'If your business is in an industry covered by the PSMB Act 2001 and has 10 or more Malaysian employees, it must register with HRD Corp and pay the Human Resources Development levy every month. This guide covers who pays, how much, and how the levy funds training.',
      },
      {
        type: 'h2',
        text: 'What is HRD Corp?',
      },
      {
        type: 'p',
        text: 'HRD Corp (Pembangunan Sumber Manusia Berhad) collects the Human Resources Development levy under the PSMB Act 2001 and funds employee training from it. It was formerly known as HRDF (Human Resources Development Fund), and "HRDF" is still widely used for the same levy.',
      },
      {
        type: 'h2',
        text: 'Who must pay the levy?',
      },
      {
        type: 'p',
        text: 'Two things decide it: your headcount of Malaysian employees and whether your industry is listed in the First Schedule of the PSMB Act 2001. The list of covered industries was widened from 1 March 2021. Federal and state government, local councils and statutory bodies are not covered.',
      },
      {
        type: 'ul',
        items: [
          '10 or more Malaysian employees → registration compulsory, 1% levy on monthly wages',
          '5 to 9 Malaysian employees → registration optional, 0.5% levy if you register',
          'Only Malaysian citizens employed under a contract of service count; domestic servants do not',
        ],
      },
      {
        type: 'h2',
        text: 'How is the levy calculated?',
      },
      {
        type: 'p',
        text: 'HRD Corp\'s formula is: (total wages or basic salaries + fixed allowances) × 1%, or × 0.5% for employers with 5 to 9 Malaysian employees. The levy may not be deducted from employees\' wages.',
      },
      {
        type: 'p',
        text: 'For example: if the wages and fixed allowances of your Malaysian employees total RM 50,000 a month, your monthly levy at 1% is RM 500. The levy is due by the 15th of each month; late payment can lead to a fine and interest.',
      },
      {
        type: 'h2',
        text: 'What can you claim?',
      },
      {
        type: 'p',
        text: 'Registered employers apply to HRD Corp for training grants. The main scheme, HRD Corp Claimable Courses (HCC), uses HRD Corp registered providers. Skim Bantuan Latihan (SBL) also allows some providers that are not registered, such as internal trainers, vendors and overseas training providers.',
      },
      {
        type: 'ul',
        items: [
          'In-house and public training',
          'Remote online training and e-learning',
          'Coaching and mentoring',
          'Development programmes',
        ],
      },
      {
        type: 'h2',
        text: 'How to make a claim',
      },
      {
        type: 'p',
        text: 'Grant applications are made in HRD Corp\'s e-TRiS system. The general process for HCC is:',
      },
      {
        type: 'ul',
        items: [
          'Step 1: Choose the scheme (HCC or SBL) and a provider that fits it',
          'Step 2: Apply for the grant in e-TRiS before training starts, with the quotation or invoice, the training schedule or course content, and the trainer profile',
          'Step 3: From 15 June 2026, in-house HCC training can start 14 days after grant approval; public HCC training 3 days after approval until 31 December 2026, then 14 days',
          'Step 4: Run the training (at least four hours for HCC)',
          'Step 5: Submit the claim within six months of the training end date',
          'Step 6: Under HCC, HRD Corp pays the provider after it approves the claim; HRD Corp pays the approved amount or the actual cost, whichever is lower',
        ],
      },
      {
        type: 'h2',
        text: 'Common mistakes employers make',
      },
      {
        type: 'ul',
        items: [
          'Not registering with HRD Corp after reaching 10 Malaysian employees in a covered industry (fines apply)',
          'Missing the monthly payment deadline of the 15th',
          'Booking a provider without checking which scheme the course falls under',
          'Applying for the grant after training has started (applications must be made before)',
          'Submitting the claim more than six months after the training ended',
        ],
      },
      {
        type: 'h2',
        text: 'Find HRD Corp registered training providers',
      },
      {
        type: 'p',
        text: 'Search training providers in Malaysia on FindTraining.com by category, state, or delivery method, then ask each one which HRD Corp scheme its course falls under.',
      },
    ],
  },
  {
    slug: 'how-to-find-hrdf-training-provider',
    title: 'How to Find an HRDF-Registered Training Provider in Malaysia',
    description:
      'Step-by-step guide to finding and vetting HRDF-registered training providers in Malaysia.',
    publishedAt: '2026-03-08',
    readingTimeMinutes: 4,
    category: 'Training Guide',
    content: [
      {
        type: 'p',
        text: 'Finding the right training provider for levy-funded training means checking two things: that the provider fits the HRD Corp scheme you will use, and that the course fits your team. Here is a practical approach.',
      },
      {
        type: 'h2',
        text: 'Why provider registration matters',
      },
      {
        type: 'p',
        text: 'Under HRD Corp Claimable Courses (HCC), the main scheme, the provider must be registered with HRD Corp and its trainers must hold HRD Corp Accreditation status. Skim Bantuan Latihan (SBL) also allows some providers that are not registered, such as internal trainers, vendors, associations, NGOs, government bodies and overseas providers.',
      },
      {
        type: 'h2',
        text: 'How FindTraining makes it easier',
      },
      {
        type: 'p',
        text: 'FindTraining.com is built for the discovery problem: search providers by category, state and delivery method in one place. Registration status changes, so confirm a provider’s HRD Corp registration with the provider or with HRD Corp before you book.',
      },
      {
        type: 'ul',
        items: [
          'Filter by category — IT, leadership, compliance, safety, language, and more',
          'Filter by state — find providers near your office or your employees',
          'Filter by delivery method — in-person, virtual classroom, or e-learning',
          'View full company profiles with descriptions and contact details',
          'Contact providers directly from their profile — no portal hopping',
        ],
      },
      {
        type: 'h2',
        text: 'What to look for in a training provider',
      },
      {
        type: 'p',
        text: 'Once you have a shortlist, use these criteria to evaluate each provider:',
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
        text: 'Before you sign, confirm with the provider which HRD Corp scheme the course falls under and what the grant application needs.',
      },
      {
        type: 'ul',
        items: [
          '"Which HRD Corp scheme does this course fall under: HCC or SBL?"',
          '"Will you provide the quotation, training schedule and trainer profile we need for the grant application?"',
          '"Are your trainers HRD Corp accredited?"',
          '"What documents will you provide after training for the claim?"',
          '"What is your typical class size, and do you offer private group delivery?"',
          '"What happens if a participant needs to cancel?"',
        ],
      },
      {
        type: 'h2',
        text: 'Browse training providers in Malaysia',
      },
      {
        type: 'p',
        text: 'Search training providers in Malaysia on FindTraining.com by category, state, and delivery method.',
      },
    ],
  },
  {
    slug: 'best-it-training-providers-malaysia-2026',
    title: 'Best IT Training Providers in Malaysia 2026 (HRDF Guide)',
    description:
      'How to choose IT and technology training providers in Malaysia, and how to fund the training from the HRD Corp levy.',
    publishedAt: '2026-03-15',
    readingTimeMinutes: 6,
    category: 'Training Guide',
    content: [
      {
        type: 'p',
        text: 'As companies upskill employees in cloud computing, data analytics, cybersecurity, and AI, HR and L&D managers need IT training providers they can trust. This guide covers what to look for and how to fund the training from the HRD Corp levy.',
      },
      {
        type: 'h2',
        text: 'What to look for in an IT training provider',
      },
      {
        type: 'p',
        text: 'IT training has a wide quality range. A compliance training provider can often rely on standardised content, but IT training needs to stay current with fast-moving vendor ecosystems. Key quality signals:',
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
        text: 'Cybersecurity is now a board-level concern. Look for providers offering CompTIA Security+, Certified Ethical Hacker (CEH), CISSP, or ISO 27001 lead implementer courses. The best providers run simulated attack environments ("cyber ranges") rather than classroom theory alone.',
      },
      {
        type: 'h3',
        text: 'Cloud Computing',
      },
      {
        type: 'p',
        text: 'Microsoft Azure, Amazon Web Services, and Google Cloud Platform certifications are in high demand across all sectors. Prioritise providers who are official authorised training partners (ATPs) for these platforms — this ensures content is current, trainers are certified, and exam vouchers are included.',
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
        text: 'Plan your IT training calendar at least 12 months ahead and use your levy balance intentionally rather than scrambling at year end.',
      },
      {
        type: 'ul',
        items: [
          'Plan a 12-month training roadmap at the start of the financial year to avoid end-of-year scrambles',
          'Batch employees into group cohorts to reduce per-head cost and increase levy efficiency',
          'Stack certifications: foundation → associate → professional (e.g. AZ-900 → AZ-104 → AZ-305)',
          'Negotiate in-house delivery for teams of 8 or more — most IT providers offer this and it reduces levy spend per participant',
          'Keep records: attendance, invoice and certificates; claims are due within six months of the training end date',
        ],
      },
      {
        type: 'h2',
        text: 'Find IT training providers in Malaysia',
      },
      {
        type: 'p',
        text: 'Browse IT and technology training providers on FindTraining.com and filter by delivery method and state. Ask each provider which HRD Corp scheme its course falls under.',
      },
    ],
  },
  {
    slug: 'how-to-submit-hrdf-claim-etris',
    title: 'How to Submit an HRDF Levy Claim on eTRiS: Step-by-Step Guide',
    description:
      'A complete walkthrough of the HRD Corp eTRiS portal — from logging in to getting your training claim approved.',
    publishedAt: '2026-04-05',
    readingTimeMinutes: 7,
    category: 'HR Compliance',
    content: [
      {
        type: 'p',
        text: 'Training funded from the HRD Corp levy starts with a grant application in HRD Corp\'s e-TRiS system and ends with a claim. This guide covers the steps and deadlines HRD Corp publishes for its two main schemes.',
      },
      {
        type: 'h2',
        text: 'Step 1: Pick the scheme',
      },
      {
        type: 'ul',
        items: [
          'HRD Corp Claimable Courses (HCC) — the main scheme. The provider must be HRD Corp registered. You make no advance payment; HRD Corp pays the provider after it approves the claim. In e-TRiS the scheme code reads "HRD Corp Claimable Courses: Skim Bantuan Latihan Khas".',
          'Skim Bantuan Latihan (SBL) — for internal trainers, vendors, associations, NGOs, government bodies, overseas providers and providers with an exemption. You pay the provider, then claim reimbursement.',
          'Other HRD Corp schemes exist; see the schemes listed on hrdcorp.gov.my.',
        ],
      },
      {
        type: 'h2',
        text: 'Step 2: Apply for the grant before training starts',
      },
      {
        type: 'p',
        text: 'Both schemes require the application before the training start date. For HCC, have these ready: the quotation or invoice, the training schedule or course content, and the trainer profile.',
      },
      {
        type: 'ul',
        items: [
          'HCC in-house training: from 15 June 2026, training can start 14 days after grant approval and must start within 90 calendar days after that.',
          'HCC public training: from 15 June to 31 December 2026, training can start 3 days after grant approval and must start within 90 calendar days after that. From 1 January 2027 the 14-day rule applies again.',
          'SBL: training must start within six months of the grant application.',
        ],
      },
      {
        type: 'h2',
        text: 'Step 3: Run the training',
      },
      {
        type: 'p',
        text: 'HCC funds in-house or public training of at least four hours. SBL in-house training takes 2 to 40 participants and public training 1 to 9. Trainees must attend at least 75% of the training hours; allowances are prorated by attendance.',
      },
      {
        type: 'h2',
        text: 'Step 4: Submit the claim within six months',
      },
      {
        type: 'p',
        text: 'For both schemes, claims must be submitted within six months of the training completion date. When the training provider submits the claim, it needs its invoice to HRD Corp, the Joint Declaration 14 form (JD14), the attendance form T3 and, for online training, a system-generated attendance report. For SBL, you submit the receipt and invoice for the training fees, plus any travel receipts.',
      },
      {
        type: 'h2',
        text: 'Step 5: Payment',
      },
      {
        type: 'p',
        text: 'HRD Corp pays the approved amount or the actual cost, whichever is lower. Under HCC the payment goes to the training provider; under SBL it reimburses you.',
      },
      {
        type: 'callout',
        text: 'HRD Corp\'s rules change. Check the scheme pages on hrdcorp.gov.my before each application.',
      },
    ],
  },
  {
    slug: 'hrdf-approved-soft-skills-training-malaysia',
    title: 'HRDF Soft Skills Training Programmes in Malaysia (2026)',
    description:
      'Leadership, communication, and team-building programmes in Malaysia, how to fund them from the HRD Corp levy, and what to look for.',
    publishedAt: '2026-04-05',
    readingTimeMinutes: 6,
    category: 'Training Guide',
    content: [
      {
        type: 'p',
        text: 'Technical skills get people hired; communication, leadership, and critical thinking skills determine how far they go. This guide covers the most sought-after soft skills programmes in Malaysia and how to fund them from your levy.',
      },
      {
        type: 'h2',
        text: 'Can soft skills training be funded from the levy?',
      },
      {
        type: 'p',
        text: 'HRD Corp describes its main scheme, HRD Corp Claimable Courses (HCC), as funding the retraining and upskilling of employees in line with the company\'s operational and business needs. The topic is not limited to technical subjects; what matters is that the training meets the scheme\'s conditions.',
      },
      {
        type: 'callout',
        text: 'For HCC: an HRD Corp registered provider, accredited trainers, at least four hours of training, and a grant application before training starts.',
      },
      {
        type: 'h2',
        text: 'Common soft skills categories',
      },
      {
        type: 'ul',
        items: [
          'Leadership & management development — for supervisors, managers, and senior individual contributors',
          'Business communication & presentation skills — public speaking, business writing, meeting facilitation',
          'Emotional intelligence & interpersonal skills — self-awareness, empathy, conflict resolution',
          'Critical thinking & problem solving — structured decision-making, first-principles thinking',
          'Team building & collaboration — group dynamics, trust building, cross-functional teamwork',
          'Time management & personal productivity — prioritisation frameworks, reducing work stress',
          'Customer service excellence — service culture, complaint handling, front-line communication',
          'Negotiation & influencing — commercial negotiation, stakeholder management',
        ],
      },
      {
        type: 'h2',
        text: 'Leadership & management training',
      },
      {
        type: 'p',
        text: 'Leadership development often has the clearest business case. Promoted technical experts who lack management skills cost companies far more in turnover and poor decisions than the cost of training. Look for programmes that cover coaching skills for managers, feedback frameworks, and situational leadership — not just theory-heavy MBA-lite content.',
      },
      {
        type: 'p',
        text: 'Best format: two to three-day workshops with real manager case studies, optional follow-up coaching sessions. Group sizes under 20 tend to produce better behavioural outcomes than large conference-style programmes.',
      },
      {
        type: 'h2',
        text: 'Communication & presentation skills',
      },
      {
        type: 'p',
        text: 'Business communication training in Malaysia must account for a multilingual workforce. The best providers run separate tracks for different proficiency levels rather than a one-size-fits-all programme. Look for workshops that include video playback of presentations, live feedback, and small group practice — not just slide instruction.',
      },
      {
        type: 'p',
        text: 'Business writing programmes are particularly high-ROI for organisations where email and report quality visibly affects client relationships.',
      },
      {
        type: 'h2',
        text: 'Team building programmes — what actually works',
      },
      {
        type: 'p',
        text: 'The Malaysian corporate team building market is flooded with outdoor activities and cooking competitions dressed up as "experiential learning." These are fun but rarely produce lasting behavioural change. The best team building programmes include a diagnostic phase (team assessment or psychometrics), structured debrief facilitation, and a follow-through action plan that teams take back to work.',
      },
      {
        type: 'ul',
        items: [
          'One-off outdoor activities with no debrief — low long-term ROI',
          'DISC or MBTI profiling workshops with application to real team dynamics — higher ROI',
          'Facilitated team charter workshops that produce agreements on ways of working — highest ROI',
          'Cross-functional project simulations with real business decisions — excellent for senior teams',
        ],
      },
      {
        type: 'h2',
        text: 'How to evaluate a soft skills training provider',
      },
      {
        type: 'p',
        text: 'Soft skills training quality is harder to assess upfront than technical training because there are no exam pass rates or vendor certifications. Use these proxies instead:',
      },
      {
        type: 'ul',
        items: [
          'Ask for the trainer\'s biography — are they a practising professional or a career trainer?',
          'Request a sample participant evaluation from a previous cohort',
          'Ask what behaviour change looks like 90 days after the programme',
          'Check whether the programme is customised to your industry context or generic',
          'Ask for two or three client references you can actually call',
          'Confirm with the provider which HRD Corp scheme the course falls under before you apply',
        ],
      },
      {
        type: 'h2',
        text: 'Which grant scheme to use for soft skills',
      },
      {
        type: 'p',
        text: 'With an HRD Corp registered provider, the main scheme is HRD Corp Claimable Courses (HCC). With an internal trainer or a provider that is not registered, Skim Bantuan Latihan (SBL) may apply. Ask the provider which scheme its course falls under before you apply.',
      },
      {
        type: 'h2',
        text: 'Browse soft skills training providers in Malaysia',
      },
      {
        type: 'p',
        text: 'FindTraining.com lists training providers in Malaysia who specialise in soft skills, leadership, and professional development.',
      },
    ],
  },
  {
    slug: 'sales-training-providers-malaysia',
    title: 'Sales Training Providers in Malaysia: What to Look for in 2026',
    description:
      'How Malaysian companies choose sales training programmes — from methodology to HRDF eligibility. Key questions to ask before you commit.',
    publishedAt: '2026-04-05',
    readingTimeMinutes: 5,
    category: 'Training Guide',
    content: [
      {
        type: 'p',
        text: 'Sales training is one of the highest-ROI investments a company can make — and one of the easiest to waste money on. A two-day motivational workshop that produces no lasting change in pipeline metrics is worse than no training at all. This guide helps HR and sales leaders in Malaysia choose providers that actually move the revenue needle, while keeping costs claimable through HRD Corp.',
      },
      {
        type: 'h2',
        text: 'Is sales training claimable under HRDF?',
      },
      {
        type: 'p',
        text: 'Sales training can be funded from the levy if it meets the conditions of the scheme you use. Under HRD Corp Claimable Courses (HCC), that means an HRD Corp registered provider, accredited trainers, at least four hours of training, and a grant application before training starts. The levy itself is 1% of monthly wages for employers with 10 or more Malaysian employees, or 0.5% for employers with 5 to 9 who register.',
      },
      {
        type: 'h2',
        text: 'Types of sales training programmes available in Malaysia',
      },
      {
        type: 'ul',
        items: [
          'B2B consultative selling — SPIN Selling, Challenger Sale, solution selling frameworks',
          'Retail and front-line sales — product knowledge, objection handling, upsell techniques',
          'Key account management — relationship deepening, account planning, executive engagement',
          'Sales leadership & coaching — managing pipelines, coaching reps, forecasting accuracy',
          'Negotiation skills — commercial negotiation, win-win techniques, BATNA preparation',
          'Inside sales & virtual selling — phone and video-based sales in remote environments',
          'CRM adoption training — Salesforce, HubSpot, or custom CRM usage for sales teams',
        ],
      },
      {
        type: 'h2',
        text: 'What separates good sales training from bad',
      },
      {
        type: 'p',
        text: 'The Malaysian market has a long tail of motivational sales trainers who generate high energy in the room but produce little change in actual sales behaviour. The research on training effectiveness is clear: a workshop alone retains roughly 10% of content after 30 days without reinforcement. Here is what the best providers do differently:',
      },
      {
        type: 'ul',
        items: [
          'Pre-training needs analysis — they ask about your sales process, customer profile, and current conversion data before designing the programme',
          'Role-play with real customer scenarios — not generic scripts',
          'Post-training coaching or manager reinforcement — a follow-up session 30-60 days later',
          'Measurement framework — clear KPIs before and after (pipeline velocity, close rate, deal size)',
          'Industry-specific customisation — manufacturing sales is different from property or professional services',
        ],
      },
      {
        type: 'h2',
        text: 'Questions to ask a sales training provider before booking',
      },
      {
        type: 'callout',
        text: 'Ask every provider: "What does success look like 90 days after this programme — and how will we measure it?" Providers who cannot answer this clearly are selling a workshop, not training outcomes.',
      },
      {
        type: 'ul',
        items: [
          '"What sales methodology does this programme teach, and why is it suited to our industry?"',
          '"Can the content be customised to our actual customer types and competitive environment?"',
          '"What post-training reinforcement options do you offer?"',
          '"Can you share a case study from a company similar to ours?"',
          '"Which HRD Corp scheme does this course fall under: HCC or SBL?"',
          '"What is the trainer\'s background? Have they actually sold professionally, or only trained?"',
        ],
      },
      {
        type: 'h2',
        text: 'Sales leadership vs. sales team training',
      },
      {
        type: 'p',
        text: 'Many companies invest in front-line sales rep training but neglect their sales managers. This is a leverage mistake. A sales manager who coaches poorly or fails to reinforce new techniques actively undermines training ROI. Sales leadership programmes — which cover pipeline coaching, deal reviews, forecast hygiene, and rep development conversations — deliver disproportionate return when combined with front-line training.',
      },
      {
        type: 'h2',
        text: 'Using HRDF levy for sales training: practical notes',
      },
      {
        type: 'ul',
        items: [
          'HCC funds in-house or public training of at least four hours, with an HRD Corp registered provider',
          'SBL in-house training takes 2 to 40 participants; public training 1 to 9',
          'Apply for the grant in e-TRiS before the training starts',
          'Submit the claim within six months of the training end date',
        ],
      },
      {
        type: 'h2',
        text: 'Find sales training providers in Malaysia',
      },
      {
        type: 'p',
        text: 'Browse sales training providers in Malaysia on FindTraining.com, filterable by delivery method and state.',
      },
    ],
  },
  {
    slug: 'hrdf-levy-vs-hrd-corp-explained',
    title: 'HRDF vs HRD Corp: What It Means for Employers',
    description:
      'How the names HRDF and HRD Corp relate, and the levy and grant rules employers follow today.',
    publishedAt: '2026-04-05',
    readingTimeMinutes: 5,
    category: 'HR Compliance',
    content: [
      {
        type: 'p',
        text: 'Employers and training providers still say "HRDF" when they mean HRD Corp. This guide explains how the two names relate and what the rules are today.',
      },
      {
        type: 'h2',
        text: 'Same levy, newer name',
      },
      {
        type: 'p',
        text: 'HRDF stands for Human Resources Development Fund, the name used for the levy system in HRD Corp\'s own earlier circulars. HRD Corp (Pembangunan Sumber Manusia Berhad) is the name the body uses today. The levy is still collected under the Pembangunan Sumber Manusia Berhad (PSMB) Act 2001.',
      },
      {
        type: 'h2',
        text: 'Who must register',
      },
      {
        type: 'ul',
        items: [
          '10 or more Malaysian employees in a covered industry: registration compulsory, levy 1% of monthly wages',
          '5 to 9 Malaysian employees in a covered industry: registration optional, levy 0.5% if you register',
          'Covered industries are listed in the First Schedule of the PSMB Act 2001; the list was widened from 1 March 2021',
          'Federal and state government, local councils and statutory bodies are not covered',
        ],
      },
      {
        type: 'h2',
        text: 'The two main schemes today',
      },
      {
        type: 'ul',
        items: [
          'HRD Corp Claimable Courses (HCC): HRD Corp registered provider, no advance payment by the employer, HRD Corp pays the provider after approving the claim',
          'Skim Bantuan Latihan (SBL): allows internal trainers, vendors, overseas providers and other non-registered providers; the employer pays, then claims reimbursement',
        ],
      },
      {
        type: 'h2',
        text: 'Key takeaways for employers',
      },
      {
        type: 'ul',
        items: [
          'HRDF and HRD Corp refer to the same levy system',
          'Grant applications and claims are made in HRD Corp\'s e-TRiS system',
          'Apply before training starts; claim within six months of the training end date',
          'Check HRD Corp\'s scheme pages before each application, as the rules change',
        ],
      },
    ],
  },
  {
    slug: 'training-budget-planning-malaysia',
    title: 'How to Plan Your Corporate Training Budget in Malaysia (With HRDF)',
    description:
      'A practical framework for HR managers to allocate training budgets, maximise HRD Corp levy utilisation, and track ROI on L&D spend.',
    publishedAt: '2026-04-05',
    readingTimeMinutes: 6,
    category: 'Training Guide',
    content: [
      {
        type: 'p',
        text: 'Training budgets left to the last quarter end up rushed. A structured annual training budget, built around how the HRD Corp levy works, avoids that. Here is a practical way to do it.',
      },
      {
        type: 'h2',
        text: 'Understand your levy balance and contribution rate first',
      },
      {
        type: 'p',
        text: 'Before you plan a single programme, know your numbers: your monthly levy and what you have already committed to training.',
      },
      {
        type: 'ul',
        items: [
          'Monthly levy = (wages or basic salaries + fixed allowances of Malaysian employees) × 1%, or × 0.5% for employers with 5 to 9 Malaysian employees who register',
          'Yearly levy = monthly levy × 12 (if payroll stays constant)',
          'HRD Corp pays the approved amount or the actual cost, whichever is lower, within its cost limits',
          'Your own training budget (outside the levy) should be planned separately but alongside levy-funded training',
        ],
      },
      {
        type: 'h2',
        text: 'Step 1: Run a skills gap analysis before allocating budget',
      },
      {
        type: 'p',
        text: 'A training calendar built without a skills gap analysis is just a list of courses. Start with the business strategy for the year: what capabilities does the company need that it does not currently have? Interview department heads, review performance appraisal themes, and check what skills are being hired for externally — these are proxy signals for internal training gaps.',
      },
      {
        type: 'callout',
        text: 'Ask every department head: "What is the one skill gap that, if closed, would most improve your team\'s output this year?" Four to six focused training priorities beat twenty scattered ones every time.',
      },
      {
        type: 'h2',
        text: 'Step 2: Categorise training by priority tier',
      },
      {
        type: 'p',
        text: 'Not all training has equal urgency. Segmenting your plan into three tiers prevents budget overcommitment and keeps planning agile:',
      },
      {
        type: 'ul',
        items: [
          'Tier 1 — Mandatory & compliance: safety training and regulatory certifications. Book first, ring-fence budget.',
          'Tier 2 — Strategic capability: digital skills, leadership development, technical upskilling tied to business strategy. Allocate the bulk of levy here.',
          'Tier 3 — Nice-to-have: team building, general professional development, exploratory courses. Fund only if budget remains after Tiers 1 and 2.',
        ],
      },
      {
        type: 'h2',
        text: 'Step 3: Map training to HRDF grant schemes',
      },
      {
        type: 'p',
        text: 'The scheme decides who pays the provider and which deadlines apply. Map each programme to its scheme before committing:',
      },
      {
        type: 'ul',
        items: [
          'HRD Corp Claimable Courses (HCC) — HRD Corp registered provider; no advance payment; HRD Corp pays the provider after approving the claim',
          'Skim Bantuan Latihan (SBL) — internal trainers, vendors, overseas and other non-registered providers; you pay, then claim reimbursement',
        ],
      },
      {
        type: 'h2',
        text: 'Step 4: Build a 12-month training calendar',
      },
      {
        type: 'p',
        text: 'Spread training across the year intentionally. Concentrate compliance training in Q1, strategic capability programmes in Q2 and Q3, and leave Q4 lighter to catch unforeseen needs. Avoid the common trap of loading all training into November and December when operational pressure is highest and attendance suffers.',
      },
      {
        type: 'p',
        text: 'For each programme, record: programme name, provider name and HRD Corp number, anticipated dates, participants, estimated cost, levy claim amount, and eTRiS application deadline. A simple spreadsheet beats a complex HRMS system for this purpose.',
      },
      {
        type: 'h2',
        text: 'Step 5: Measure training ROI (practically)',
      },
      {
        type: 'p',
        text: 'Full Kirkpatrick Level 4 ROI analysis is rarely practical for most organisations. Use a simpler three-point check:',
      },
      {
        type: 'ul',
        items: [
          'Level 1 — Reaction: did participants rate the training positively? (collect immediately post-training)',
          'Level 2 — Learning: can participants demonstrate the key skill? (test or observed practice)',
          'Level 3 — Behaviour: is the skill being applied 60-90 days later? (manager check-in)',
        ],
      },
      {
        type: 'p',
        text: 'For strategic programmes, add a business outcome metric agreed upfront — close rate for sales training, error rate for quality training, deployment frequency for DevOps training. Pre-agree the measurement with the business owner before training runs.',
      },
      {
        type: 'h2',
        text: 'Common training budget mistakes in Malaysia',
      },
      {
        type: 'ul',
        items: [
          'Planning training without checking your levy position first — leading to over-budgeting',
          'Booking a provider without checking which HRD Corp scheme the course falls under',
          'Applying for the grant after training has started — applications must be made before',
          'Allocating most levy to one department while others have urgent skill gaps',
          'Missing the six-month claim deadline after training ends',
          'Failing to keep attendance records — trainees must attend at least 75% of training hours',
        ],
      },
      {
        type: 'h2',
        text: 'Find training providers for your annual plan',
      },
      {
        type: 'p',
        text: 'Use FindTraining.com to find training providers for every category in your annual plan — from compliance to leadership to digital skills. Use the HRDF levy calculator to estimate your annual levy contribution.',
      },
    ],
  },
  {
    slug: 'uk-apprenticeship-levy-guide',
    title: 'The UK Apprenticeship Levy: A Practical Guide for Employers',
    description:
      'How the UK Apprenticeship Levy works, who pays it, how much, and how to spend it through your digital apprenticeship account before it expires.',
    publishedAt: '2026-05-23',
    readingTimeMinutes: 6,
    category: 'UK Employer Funding',
    content: [
      {
        type: 'p',
        text: 'If your UK business has an annual pay bill above £3 million, you are an apprenticeship levy payer. The levy is 0.5% of your annual pay bill, paid monthly via PAYE. Funds sit in a digital apprenticeship service account and expire 24 months after they enter — so a real cost of unspent levy is real money lost back to the Treasury. This guide covers the mechanics, who is eligible, and what training the levy actually funds.',
      },
      {
        type: 'h2',
        text: 'What the Apprenticeship Levy is',
      },
      {
        type: 'p',
        text: 'The Apprenticeship Levy was introduced in April 2017 by HMRC. It is a UK-wide tax on employer pay bills, with the receipts funnelled into a fund that pays for accredited apprenticeship training in England. (Scotland, Wales, and Northern Ireland receive a Barnett-formula share that is spent through their own devolved skills systems.) Levy-paying employers in England access their share via a digital apprenticeship service account, which credits funds with a 10% government top-up.',
      },
      {
        type: 'h2',
        text: 'Who pays — and how much',
      },
      {
        type: 'ul',
        items: [
          'Annual pay bill > £3 million → 0.5% levy on the portion above £3m (you receive a £15,000 annual allowance offset)',
          'Annual pay bill < £3 million → not a levy payer, but can still access apprenticeship funding via co-investment (95% government, 5% employer)',
          'Connected companies (groups) calculate one combined pay bill and share one £15,000 allowance',
          'The levy is paid monthly through PAYE alongside Income Tax and National Insurance',
        ],
      },
      {
        type: 'h2',
        text: 'The 24-month expiry rule',
      },
      {
        type: 'p',
        text: 'Each monthly deposit into your digital account has an individual 24-month clock. Funds expire on a rolling first-in, first-out basis. A levy payer that funded the account in May 2024 must spend that May 2024 deposit by May 2026 or lose it. This is why levy-paying employers should treat unspent funds as an active cost line, not a passive credit.',
      },
      {
        type: 'h2',
        text: 'What the levy can — and cannot — be spent on',
      },
      {
        type: 'p',
        text: 'Apprenticeship Levy funds can only be spent on the training and end-point assessment portion of an apprenticeship that is on the approved register — see the Institute for Apprenticeships standards list. They cannot be used for apprentice wages, travel, accommodation, equipment, or non-apprenticeship training. The fund is for accredited, multi-month structured programmes, not short courses.',
      },
      {
        type: 'ul',
        items: [
          'Eligible: Level 2 to Level 7 apprenticeship standards delivered by Register of Apprenticeship Training Providers (RoATP) providers',
          'Eligible: end-point assessment fees',
          'Not eligible: apprentice salary, statutory training (e.g. mandatory health and safety inductions), CPD short courses, university degrees outside an apprenticeship route',
          'Transferable: up to 50% of your annual levy can be transferred to other employers',
        ],
      },
      {
        type: 'h2',
        text: 'How to find an approved apprenticeship provider',
      },
      {
        type: 'p',
        text: 'In England, only providers on the Register of Apprenticeship Training Providers (RoATP) can deliver levy-funded apprenticeships. The official directory is the Find apprenticeship training service operated by the Department for Education. FindTraining indexes a subset of these providers — particularly those who also offer commercial (non-levy) training — alongside their delivery methods and locations. Filter by GB on findtraining.com to browse.',
      },
      {
        type: 'h2',
        text: 'Common mistakes to avoid',
      },
      {
        type: 'ul',
        items: [
          'Treating the levy as sunk cost — every unspent month is real money that exits the account in 24 months',
          'Assuming all training is levy-eligible — only on-RoATP apprenticeships qualify',
          'Forgetting the 5% co-investment if your apprenticeship cost exceeds your account balance',
          'Ignoring the 50% transfer rule — useful if you cannot use the full allowance internally',
        ],
      },
      {
        type: 'h2',
        text: 'How FindTraining helps',
      },
      {
        type: 'p',
        text: 'FindTraining indexes UK training providers, including those on the Find Apprenticeship Training register. Browse the UK directory at findtraining.com/gb to see categories, delivery methods, and contact options. For levy-funded apprenticeship procurement specifically, always cross-check the official Find apprenticeship training service to confirm RoATP status before contracting.',
      },
    ],
  },
  {
    slug: 'skillsfuture-credit-employer-guide-singapore',
    title: 'SkillsFuture Credit and Employer Funding in Singapore: A Practical Guide',
    description:
      'How SkillsFuture Credit, Enhanced Subsidies, and the Absentee Payroll scheme work for Singapore employers — and how to access SSG-approved training.',
    publishedAt: '2026-05-23',
    readingTimeMinutes: 6,
    category: 'Singapore Employer Funding',
    content: [
      {
        type: 'p',
        text: 'Singapore employers have one of the most generous workforce development funding regimes in the region — but it operates through several overlapping schemes administered by SkillsFuture Singapore (SSG) and Workforce Singapore (WSG). This guide separates the employer-side schemes from the individual ones, so HR and L&D teams know exactly what is on the table.',
      },
      {
        type: 'h2',
        text: 'SkillsFuture vs. SkillsFuture Credit',
      },
      {
        type: 'p',
        text: 'SkillsFuture is the umbrella national movement. SkillsFuture Credit is one specific instrument within it — a S$500 credit (plus periodic top-ups) granted to every Singapore citizen aged 25 and above to spend on approved courses. The credit is held by the individual, not the employer. Employers cannot directly spend an employee\'s SkillsFuture Credit, but they can run training where employees use their credit to offset their share of fees.',
      },
      {
        type: 'h2',
        text: 'Employer-funded schemes',
      },
      {
        type: 'ul',
        items: [
          'SkillsFuture Enterprise Credit (SFEC) — S$10,000 credit per qualifying employer (90% subsidy on eligible workforce transformation costs incl. training)',
          'Enhanced Training Support for SMEs (ETSS) — up to 90% subsidy on SSG-funded course fees for SME employees',
          'Absentee Payroll (AP) funding — reimbursement of basic monthly salary for SME employees attending eligible training during working hours',
          'Mid-Career Pathways Programme — for hiring and training mid-career workers (40+)',
          'Career Conversion Programme (CCP) — salary support during reskilling for hires moving into new sectors or roles',
        ],
      },
      {
        type: 'h2',
        text: 'What counts as SSG-approved training',
      },
      {
        type: 'p',
        text: 'SSG-approved courses are listed on the MySkillsFuture portal under the "Course Directory". Approval is course-level (each individual course is assessed), not provider-level — though a provider can be an "Approved Training Organisation" (ATO) which streamlines new-course submissions. When sourcing training, verify the specific course you want to run is listed under "Funded Courses" before committing — provider accreditation alone does not guarantee subsidy eligibility for a given course.',
      },
      {
        type: 'h2',
        text: 'How the subsidy stack works in practice',
      },
      {
        type: 'p',
        text: 'For an SME employer enrolling a Singapore Citizen employee in a SkillsFuture-funded course, the funding stack typically looks like: SSG course-fee subsidy (covers a base percentage) + Enhanced Training Support for SMEs (raises subsidy to up to 90%) + Absentee Payroll (reimburses basic salary at 80% capped at S$4.50 per training hour). Net employer outlay is often 10–20% of the headline course fee plus the AP-uncovered salary portion.',
      },
      {
        type: 'h2',
        text: 'Eligibility rules to check before enrolling',
      },
      {
        type: 'ul',
        items: [
          'Employee must be a Singapore Citizen or Permanent Resident for full subsidy access (some schemes are Citizen-only)',
          'Employer must be SME-classified for ETSS and SFEC (group revenue and headcount tests apply)',
          'Course must be on the SSG-funded list at the time of enrolment',
          'AP funding requires the training to be conducted during normal working hours',
        ],
      },
      {
        type: 'h2',
        text: 'How to find an Approved Training Organisation',
      },
      {
        type: 'p',
        text: 'The MySkillsFuture portal at myskillsfuture.gov.sg/content/portal/en/career/job-search/training-providers.html lists every ATO. FindTraining indexes a subset of these providers — search the Singapore directory at findtraining.com/sg to filter by category, delivery method, and contact options. Always cross-check the official portal for the latest accreditation status before contracting.',
      },
      {
        type: 'h2',
        text: 'How FindTraining helps',
      },
      {
        type: 'p',
        text: 'FindTraining indexes Singapore training providers with their delivery methods and contact details. Browse at findtraining.com/sg, narrow by category, and reach out via the providers\' contact details. We do not handle SkillsFuture claims directly — those go through the MySkillsFuture portal — but we cut the discovery time on the front of the process.',
      },
    ],
  },
  {
    slug: 'australia-rto-buyers-guide',
    title: 'Working with Australian RTOs: A Buyer\'s Guide for HR and L&D',
    description:
      'What an RTO is, how to verify accreditation, and how to use state and federal funding when procuring training for Australian teams.',
    publishedAt: '2026-05-23',
    readingTimeMinutes: 6,
    category: 'Australia Employer Funding',
    content: [
      {
        type: 'p',
        text: 'In Australia, "RTO" — Registered Training Organisation — is the only accreditation that allows a provider to issue nationally recognised qualifications under the Australian Qualifications Framework. If you are buying training in Australia and the outcome matters (compliance, formal qualifications, government-funded co-payment), the provider must be an RTO. This guide explains how to verify status, where to find providers, and what state-level funding sits behind the buyer side.',
      },
      {
        type: 'h2',
        text: 'What an RTO is',
      },
      {
        type: 'p',
        text: 'An RTO is a training provider registered with the Australian Skills Quality Authority (ASQA) — or, for a small number of providers in Victoria and Western Australia, their respective state regulators. ASQA registration permits the RTO to deliver and assess training packages and accredited courses on its scope of registration, and to issue AQF-aligned qualifications and statements of attainment.',
      },
      {
        type: 'h2',
        text: 'How to verify an RTO',
      },
      {
        type: 'p',
        text: 'The authoritative source is training.gov.au — the National Register on VET. Every RTO has a four-digit RTO code, a current scope of registration, and a status (Current / Suspended / Cancelled). Three things to check before signing a contract:',
      },
      {
        type: 'ul',
        items: [
          'Status is Current (not Suspended or Cancelled)',
          'Scope of registration includes the specific qualification or unit you want delivered',
          'Registration expiry date is comfortably beyond your training delivery window',
        ],
      },
      {
        type: 'h2',
        text: 'State-level funding for employers',
      },
      {
        type: 'p',
        text: 'Workforce skills funding in Australia is state-administered through subsidised training lists. Each state defines its own subsidy schedule and eligibility criteria — the headline programmes vary by state and change year to year. Before procuring training, check the current programme name and rules for the relevant state on the state training-authority website.',
      },
      {
        type: 'ul',
        items: [
          'NSW — Smart and Skilled (subsidised qualifications from the NSW Skills List)',
          'VIC — Skills First (subsidies via Victorian Training Guarantee)',
          'QLD — Certificate 3 Guarantee + User Choice (apprenticeships)',
          'WA — Jobs and Skills WA (priority occupation list)',
          'SA — Subsidised Training List + WorkReady',
          'TAS, NT, ACT — Each has its own subsidised training list and eligibility tests',
        ],
      },
      {
        type: 'h2',
        text: 'Federal layer: apprenticeships and traineeships',
      },
      {
        type: 'p',
        text: 'The Australian Apprenticeships Incentive System (AAIS) sits at the federal level, providing employer incentives for hiring apprentices and trainees in priority occupations. Payments are made through Australian Apprenticeship Support Network (AASN) providers, not directly between the RTO and employer. If you are hiring rather than upskilling existing staff, route the AAIS conversation through your AASN before contracting the RTO.',
      },
      {
        type: 'h2',
        text: 'What to look for in an RTO procurement',
      },
      {
        type: 'ul',
        items: [
          'RTO code + current scope confirmed on training.gov.au',
          'Trainer credentials — TAE40122 (or equivalent) for the trainer/assessor delivering the qualification',
          'Delivery mode that matches your team — face-to-face, blended, online, workplace-based',
          'Recognition of Prior Learning (RPL) pathway available if relevant',
          'State subsidy eligibility confirmed in writing — do not assume',
        ],
      },
      {
        type: 'h2',
        text: 'How FindTraining helps',
      },
      {
        type: 'p',
        text: 'FindTraining indexes Australian training providers, including a starter set of RTOs imported from training.gov.au. Browse the Australia directory at findtraining.com/au, filter by category and delivery method, and reach out via the providers\' published contact details. We always recommend cross-checking RTO status on training.gov.au before contracting — a directory listing is a starting point, not an accreditation guarantee.',
      },
    ],
  },
  {
    slug: 'how-to-choose-training-provider-malaysia',
    title: 'How to Choose a Training Provider in Malaysia: A 7-Step Framework',
    description:
      'A practical seven-step shortlist for HR and L&D managers in Malaysia — from HRD Corp verification through proposal scoring to post-training evaluation.',
    publishedAt: '2026-05-23',
    readingTimeMinutes: 7,
    category: 'Buyer Guide',
    content: [
      {
        type: 'p',
        text: 'Most HR managers in Malaysia have a procurement playbook for office supplies but no equivalent for training providers. The result is that the choice tends to default to whoever someone in the company worked with before. This guide gives you a seven-step framework you can use on every training procurement — from levy-claimable HRD Corp courses through to leadership development engagements.',
      },
      {
        type: 'h2',
        text: 'Step 1 — Define the outcome before you scope the course',
      },
      {
        type: 'p',
        text: 'The single most common mistake is starting from "we need leadership training" rather than "in 6 months, we need our middle managers to run weekly 1:1s and deliver written feedback every quarter". Outcome-first scoping shrinks the provider shortlist immediately, because most providers cannot evidence outcomes — they sell content. The few that can are worth a second look.',
      },
      {
        type: 'h2',
        text: 'Step 2 — Verify HRD Corp registration',
      },
      {
        type: 'p',
        text: 'For HRD Corp Claimable Courses (HCC), the main levy scheme, the provider must be HRD Corp registered and its trainers accredited. Skim Bantuan Latihan (SBL) allows some non-registered providers. Ask the provider in writing which scheme the course falls under before signing.',
      },
      {
        type: 'h2',
        text: 'Step 3 — Shortlist three to five providers, not more',
      },
      {
        type: 'p',
        text: 'A shortlist of three to five gives you enough comparison without burning weeks on procurement. Use category and state filters on findtraining.com to surface candidates. For specialist categories — for example sales training or technical certifications — the eligible pool is small enough that five is realistic. For generic categories like soft skills, narrow the shortlist using the delivery method filter.',
      },
      {
        type: 'h2',
        text: 'Step 4 — Ask each provider for the same five things',
      },
      {
        type: 'ul',
        items: [
          'A course outline with hour-by-hour breakdown',
          'Trainer CVs (not just company bio)',
          'Three references from clients who ran the same course in the last 12 months',
          'Which HRD Corp scheme the course falls under (HCC or SBL)',
          'Pricing per pax + per cohort + minimum cohort size — itemised',
        ],
      },
      {
        type: 'p',
        text: 'You want apples to apples. Providers who cannot produce these — particularly the trainer CV and the references — are the ones to drop early.',
      },
      {
        type: 'h2',
        text: 'Step 5 — Score against the outcome from Step 1',
      },
      {
        type: 'p',
        text: 'Build a simple weighted scoresheet: 40% trainer fit (relevant experience to your outcome), 25% delivery method fit (in-person / hybrid / virtual matching your team\'s reality), 20% references (do they describe outcomes or content?), 15% price. Avoid scoring price above 25% — the cheapest training rarely delivers outcome change.',
      },
      {
        type: 'h2',
        text: 'Step 6 — Pilot before you commit at scale',
      },
      {
        type: 'p',
        text: 'For anything beyond a single-cohort engagement, run a one-cohort pilot first. The cost is a fraction of the full engagement, and you get to see the trainer in your room with your team before you commit to the full programme. Providers worth working with will agree to a pilot at standard pricing.',
      },
      {
        type: 'h2',
        text: 'Step 7 — Plan the post-training measurement at the start',
      },
      {
        type: 'p',
        text: 'Decide before delivery what you\'ll measure 30, 60, and 90 days after the course. "Did they enjoy it" measured on Day 0 tells you almost nothing. "Did the behaviour change" measured at Day 60 tells you whether to renew the contract.',
      },
      {
        type: 'h2',
        text: 'How FindTraining helps',
      },
      {
        type: 'p',
        text: 'Use findtraining.com to build the Step-3 shortlist — filter by category, state, and delivery method, then send the same Step-4 question set to each provider. The directory is free for buyers; we earn from the provider side when they upgrade their listing.',
      },
    ],
  },
  {
    slug: 'corporate-training-cost-malaysia-2026',
    title: "What Drives Corporate Training Cost in Malaysia: A Buyer's Guide",
    description:
      'What makes corporate training prices differ in Malaysia, the extra costs to ask about, and how to compare quotes like for like.',
    publishedAt: '2026-05-23',
    readingTimeMinutes: 4,
    category: 'Buyer Guide',
    content: [
      {
        type: 'p',
        text: 'Providers in Malaysia usually quote on request, so there is no single price list to check against. This guide covers what moves a quote up or down and what to ask, so you can compare offers on the same scope.',
      },
      {
        type: 'h2',
        text: 'Open course or in-house',
      },
      {
        type: 'p',
        text: 'An open-enrolment course is priced per person. An in-house course for a closed group is usually priced per day or as one programme fee. As your group grows, in-house delivery tends to become the better deal. Ask for both quotes when you have more than a handful of attendees.',
      },
      {
        type: 'h2',
        text: 'What moves the price',
      },
      {
        type: 'ul',
        items: [
          'Topic: technical and vendor-certified courses, compliance and safety courses, and senior leadership coaching are each priced differently from general soft skills',
          'Trainer: experience, credentials and whether the trainer is local or travelling in',
          'Branded methodologies: a licensed programme usually adds licence and workbook fees',
          'Group size and number of days',
          'Location: on-site, hotel venue or virtual',
        ],
      },
      {
        type: 'h2',
        text: 'Multi-day and repeat bookings',
      },
      {
        type: 'p',
        text: 'If you plan several days or several cohorts, ask whether the provider offers a package price or a lower day rate. For a recurring need, ask about a framework agreement with rates fixed for a set period.',
      },
      {
        type: 'h2',
        text: 'Extra costs to ask about up front',
      },
      {
        type: 'ul',
        items: [
          'Materials: workbooks, assessment licences, certification and exam fees',
          'Venue: included or excluded, and who books it',
          'Food and drink for participants',
          "Trainer travel and accommodation, for training outside the trainer's home city",
          'Post-training assessments or coaching follow-ups',
          'Cancellation and rescheduling terms',
        ],
      },
      {
        type: 'h2',
        text: 'Virtual or in person',
      },
      {
        type: 'p',
        text: 'Virtual delivery removes venue, food and travel costs, so ask what the quote looks like both ways. It suits technical and content-heavy programmes well. Behavioural and soft-skills programmes often work better in the room, where participants practise with each other.',
      },
      {
        type: 'h2',
        text: 'Levy claims and net cost',
      },
      {
        type: 'p',
        text: "If you are an HRD Corp-registered employer, you may be able to apply for financial assistance against your levy. Whether a given course and cost item is covered depends on the scheme and HRD Corp's current terms, so check the HRD Corp website and ask the provider which scheme the course is approved under before you book.",
      },
      {
        type: 'h2',
        text: 'Comparing quotes',
      },
      {
        type: 'p',
        text: 'Shortlist three to five providers in your category, send each the same scope, and ask for an itemised quote. Compare the totals only after the same items are in or out of each one. The HRDF levy calculator at /tools/hrdf-calculator gives an estimate of your annual levy.',
      },
    ],
  },
  {
    slug: 'sales-vs-leadership-training-when-to-spend',
    title: 'Sales Training vs Leadership Training: When to Spend on Which',
    description:
      'A practical framework for deciding whether your team needs sales training, leadership training, or both — and how to sequence them when budget is finite.',
    publishedAt: '2026-05-23',
    readingTimeMinutes: 5,
    category: 'Buyer Guide',
    content: [
      {
        type: 'p',
        text: 'When budget is tight, the question "do we invest in sales training or leadership development?" tends to land on the HR director\'s desk with no good way to answer it. This guide gives you a decision framework based on the team you have, the outcome you need, and the time horizon you have to deliver it.',
      },
      {
        type: 'h2',
        text: 'The shortest answer',
      },
      {
        type: 'p',
        text: 'If your sales team is hitting quota but your managers are leaving — invest in leadership training. If your managers are competent but the sales pipeline is leaking at qualification or close — invest in sales training. If both are broken, fix the manager layer first; sales training delivered into a broken management cadence does not stick.',
      },
      {
        type: 'h2',
        text: 'Sales training: what it actually delivers',
      },
      {
        type: 'p',
        text: 'Modern sales training is methodology-driven (SPIN, MEDDIC, Challenger, Sandler are the dominant frameworks in MY corporate B2B) and delivers measurable pipeline impact when paired with a manager-led coaching cadence. Without the coaching cadence, the half-life of sales training behaviour change is 4–8 weeks. Most providers offer 2–4 day initial training; the best providers offer or require a manager-coaching layer on top.',
      },
      {
        type: 'h2',
        text: 'Leadership training: what it actually delivers',
      },
      {
        type: 'p',
        text: 'Leadership training covers the broad ground of how a manager runs people: 1:1s, feedback, delegation, performance conversations, conflict, decision-making. Outcomes are slower to measure (typically 60–90 days post-training for behaviour change in 1:1 cadence and feedback frequency) but compound across every person the manager supervises. For middle managers, leadership programmes deliver more value per ringgit than any other category in the long run.',
      },
      {
        type: 'h2',
        text: 'The decision framework',
      },
      {
        type: 'ul',
        items: [
          'Sales pipeline is the bottleneck → Sales training, with manager coaching layer',
          'Manager turnover or team disengagement → Leadership training, before any other layer',
          'New manager promoted from individual contributor → Leadership training (essentials, not advanced)',
          'Senior team underperforming on strategic decisions → Executive coaching, not group training',
          'Customer-facing team but not sales (CS, support) → Customer service training, not sales',
          'Both managers and sales team need help, finite budget → Managers first, sales next quarter',
        ],
      },
      {
        type: 'h2',
        text: 'Sequencing when you have budget for both',
      },
      {
        type: 'p',
        text: 'If the budget supports both, sequence them: leadership training for managers Q1, sales training for the team Q2. This way, when sales training lands in Q2, the managers have a coaching cadence to reinforce the new behaviours. Doing them in the reverse order wastes the sales training investment, because the managers will not yet have the 1:1 cadence to reinforce it.',
      },
      {
        type: 'h2',
        text: 'How to find specialist providers in Malaysia',
      },
      {
        type: 'p',
        text: 'Browse the Sales & Marketing category and the Leadership & Management category on findtraining.com to surface providers in each. For sales training, filter by methodology in the provider description (SPIN, MEDDIC, Sandler, etc.) — the methodology match matters more than the headline brand for most B2B teams.',
      },
      {
        type: 'h2',
        text: 'How FindTraining helps',
      },
      {
        type: 'p',
        text: 'Sales: findtraining.com/categories/sales-marketing. Leadership: findtraining.com/categories/leadership-management. Both lists are filterable by state and delivery method. For combined sales-and-leadership engagements ("salesforce effectiveness", "revenue enablement"), search for those phrases.',
      },
    ],
  },
  {
    slug: 'measure-training-roi-metrics-hr-managers',
    title: 'How to Measure Training ROI: 4 Metrics HR Managers Actually Report On',
    description:
      'Skip the Kirkpatrick lecture — these are the four post-training metrics that get used in real HR reviews in Malaysian corporates, with how to set them up.',
    publishedAt: '2026-05-23',
    readingTimeMinutes: 5,
    category: 'Buyer Guide',
    content: [
      {
        type: 'p',
        text: 'Kirkpatrick\'s four-level evaluation model is taught in every L&D certification and used in almost no real HR reports. This guide skips the academic framework and shows you four metrics that work in practice — what to measure, when, and how to report it in a quarterly review.',
      },
      {
        type: 'h2',
        text: 'Why post-training "happy sheets" don\'t count',
      },
      {
        type: 'p',
        text: 'Day-0 satisfaction surveys ("rate the trainer / venue / materials") measure how the participants felt walking out the door. They do not measure outcome change, and they correlate weakly with whether the training delivered any business value. Use them for trainer quality control, not for ROI.',
      },
      {
        type: 'h2',
        text: 'Metric 1 — Behaviour-change observation at Day 60',
      },
      {
        type: 'p',
        text: 'Sixty days after training, the manager observes whether the participant is doing the new behaviour in their day-to-day work. For sales training: are reps using the new qualification questions in discovery calls? For leadership training: are managers running weekly 1:1s with a written agenda? This is the highest-signal metric and the one most often skipped.',
      },
      {
        type: 'h2',
        text: 'How to set it up',
      },
      {
        type: 'ul',
        items: [
          'Before training: agree 3-5 specific observable behaviours with the manager',
          'Day 60: manager scores each behaviour 0/1/2 (not visible / partial / consistent) for each participant',
          'Report the average score per cohort and the trend month-on-month',
        ],
      },
      {
        type: 'h2',
        text: 'Metric 2 — Lagging business indicator tied to the training outcome',
      },
      {
        type: 'p',
        text: 'Tie one lagging indicator to the training outcome — and only one. For sales training: revenue per rep, deal velocity, or pipeline conversion at the targeted stage. For leadership training: skip-level engagement scores, voluntary turnover in the trained manager\'s team, or 1:1 completion rate from calendar data. Resist the urge to measure five things; one lagging indicator with clear baseline and 90-day window is more credible than five with noisy data.',
      },
      {
        type: 'h2',
        text: 'Metric 3 — Application rate of HRDF levy spend',
      },
      {
        type: 'p',
        text: 'For HRDF-registered employers, this is the metric finance directors actually ask about: of the annual levy contribution, what percentage is being claimed back through training? Track quarterly and report against the annual levy contribution estimate (see /tools/hrdf-calculator).',
      },
      {
        type: 'h2',
        text: 'Metric 4 — Cost per behaviour-changed participant',
      },
      {
        type: 'p',
        text: 'Take the all-in training cost (provider fee + materials + venue + F&B + participant time at internal day rate) and divide by the number of participants who scored 2 on the Day-60 behaviour observation (consistent). This is your real cost per outcome. A cheap training that delivers behaviour change in 1 in 10 participants is more expensive than a premium training that delivers behaviour change in 7 in 10.',
      },
      {
        type: 'h2',
        text: 'What a quarterly L&D review looks like with these four metrics',
      },
      {
        type: 'p',
        text: 'A one-page report per programme: (1) Day-60 behaviour score chart, (2) lagging indicator pre-training baseline vs. 90-day post-training, (3) levy utilisation year-to-date, (4) cost per behaviour-changed participant by programme. That is enough to defend the L&D budget and to make renewal-or-replace decisions on each provider you work with.',
      },
      {
        type: 'h2',
        text: 'How FindTraining helps',
      },
      {
        type: 'p',
        text: 'When sourcing on findtraining.com, ask each shortlisted provider which of the four metrics above they will help you set up. Providers who include behaviour-change observation in their delivery (rather than just leaving you to do it) outperform on Metric 4 by a wide margin.',
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
