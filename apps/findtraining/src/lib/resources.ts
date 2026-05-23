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
          'Contact providers directly from their profile — no portal hopping',
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
        text: 'The eTRiS portal (etris.hrdcorp.gov.my) is where every HRDF levy claim lives or dies. It is the official channel for submitting training claims, checking your levy balance, and tracking reimbursements. Yet many HR managers find it unintuitive — missing a field or uploading the wrong document can delay or kill a claim. This step-by-step guide walks you through the entire process.',
      },
      {
        type: 'h2',
        text: 'Before you start: what you need to have ready',
      },
      {
        type: 'ul',
        items: [
          'Your company\'s eTRiS login credentials (Training Coordinator or HR Manager role)',
          'The HRD Corp registration number of your chosen training provider',
          'The course name and HRD Corp course code (get this from your provider)',
          'List of employee names and IC numbers who will attend',
          'Estimated training fees and dates',
          'Sufficient levy balance — check this first under "Levy Account" in eTRiS',
        ],
      },
      {
        type: 'callout',
        text: 'Always confirm your levy balance before booking training. Claims cannot exceed your available levy balance. If your balance is low, consider voluntary top-ups under the SBL scheme.',
      },
      {
        type: 'h2',
        text: 'Step 1: Log in and navigate to New Claim',
      },
      {
        type: 'p',
        text: 'Go to etris.hrdcorp.gov.my and log in with your employer account. From the dashboard, click "Employer" in the top navigation, then select "Training Grant Application". This is where all new claim submissions begin — not under the "Payments" section, which is a common navigation mistake.',
      },
      {
        type: 'h2',
        text: 'Step 2: Select the right grant scheme',
      },
      {
        type: 'p',
        text: 'HRD Corp offers several grant schemes, each with different rules and claim limits. Selecting the wrong one is the most common reason claims are rejected:',
      },
      {
        type: 'ul',
        items: [
          'SBL (Skim Bantuan Latihan) — standard levy-claimable training, reimbursement after training',
          'SBL-Khas — higher-priority scheme for strategic or digital economy courses, higher claim limits',
          'PROLUS — for unemployed graduates and retrenched workers, usually not applicable for active employees',
          'IBL (Industry-Based Learning) — structured on-the-job training within a company',
          'HRDF e-LATiH — for approved online and e-learning programmes',
        ],
      },
      {
        type: 'p',
        text: 'Ask your training provider which scheme the course is listed under before you start. SBL-Khas is the most generous and covers AI, cybersecurity, cloud, and leadership programmes.',
      },
      {
        type: 'h2',
        text: 'Step 3: Fill in the training programme details',
      },
      {
        type: 'p',
        text: 'Enter the course details exactly as they appear on the provider\'s HRD Corp approval letter. Mismatches — even minor ones like abbreviated names — trigger manual reviews. Required fields include:',
      },
      {
        type: 'ul',
        items: [
          'Programme title (must match exactly as registered with HRD Corp)',
          'Training provider name and HRD Corp registration number',
          'Training dates and venue (for in-person) or platform name (for e-learning)',
          'Number of training days and total hours',
          'Training fees per participant (excluding GST/SST if not applicable)',
        ],
      },
      {
        type: 'h2',
        text: 'Step 4: Add employee participants',
      },
      {
        type: 'p',
        text: 'You must list every employee who will attend the training. Each participant requires their full name as per IC, IC number, designation, and monthly salary. eTRiS automatically validates that employees are active in your payroll records. If someone was recently hired and not yet reflected, contact HRD Corp to update your employee roster before submitting.',
      },
      {
        type: 'callout',
        text: 'Only Malaysian employees count toward claimable headcount. Expatriates on work passes are excluded from both the levy calculation and claim eligibility.',
      },
      {
        type: 'h2',
        text: 'Step 5: Upload supporting documents',
      },
      {
        type: 'p',
        text: 'Pre-training documents required at the point of application include the training provider\'s quotation or invoice (proforma), the course outline or brochure, and confirmation of the training schedule. Keep the originals — you will need them again post-training.',
      },
      {
        type: 'h2',
        text: 'Step 6: Submit and await pre-approval (SBL-Khas)',
      },
      {
        type: 'p',
        text: 'Under SBL-Khas, HRD Corp must approve your claim before training begins. Submit at least two weeks before the training start date. You will receive an approval or rejection email from HRD Corp. SBL claims can typically be submitted before or after training, but pre-submission is always safer.',
      },
      {
        type: 'h2',
        text: 'Step 7: Post-training claim submission',
      },
      {
        type: 'p',
        text: 'After training is completed, you must submit the following within 30 days (60 days for some schemes):',
      },
      {
        type: 'ul',
        items: [
          'Signed attendance sheet with employee names and daily sign-off',
          'Original tax invoice from the training provider',
          'Copies of completion certificates for all participants',
          'Proof of payment if you have already paid the provider',
          'Post-training report or evaluation form (required for SBL-Khas)',
        ],
      },
      {
        type: 'h2',
        text: 'Step 8: Track claim status and receive payment',
      },
      {
        type: 'p',
        text: 'Log in to eTRiS and navigate to "Grant Application Status" to monitor your claim. Processing typically takes 14 to 30 working days. Once approved, payment is transferred directly to the training provider. If you have already paid the provider, reimbursement is credited to your company\'s bank account on file.',
      },
      {
        type: 'callout',
        text: 'If your claim is rejected, eTRiS shows a rejection reason. The most common reasons are missing documents, expired provider registration, or training dates that do not match. Rectify and resubmit — most rejections are fixable.',
      },
      {
        type: 'h2',
        text: 'Find HRDF-registered providers for your next claim',
      },
      {
        type: 'p',
        text: 'Before your next eTRiS submission, use FindTraining.com to verify a provider\'s HRD Corp registration status and find courses by category, scheme, and delivery method.',
      },
    ],
  },
  {
    slug: 'hrdf-approved-soft-skills-training-malaysia',
    title: 'Top HRDF-Approved Soft Skills Training Programmes in Malaysia (2026)',
    description:
      'Leadership, communication, and team-building programmes that qualify for HRD Corp levy claims. How to find them and what to look for.',
    publishedAt: '2026-04-05',
    readingTimeMinutes: 6,
    category: 'Training Guide',
    content: [
      {
        type: 'p',
        text: 'Soft skills training is the second-largest category of HRDF levy claims after IT training — and for good reason. Technical skills get people hired; communication, leadership, and critical thinking skills determine how far they go. This guide covers the most sought-after soft skills programmes in Malaysia and how to find HRDF-approved options worth spending your levy on.',
      },
      {
        type: 'h2',
        text: 'Why soft skills training qualifies for HRDF levy',
      },
      {
        type: 'p',
        text: 'Many employers assume HRDF levy can only be claimed for hard skills like IT, engineering, or compliance training. This is a costly misconception. HRD Corp explicitly covers soft skills programmes — leadership, communication, emotional intelligence, presentation skills, negotiation, time management, and more — provided they are delivered by a registered provider and are workplace-relevant.',
      },
      {
        type: 'callout',
        text: 'The key test for HRDF eligibility is not the topic — it is whether the training is workplace-relevant and delivered by an HRD Corp-registered provider. Most professional soft skills programmes meet this bar.',
      },
      {
        type: 'h2',
        text: 'Most claimed soft skills categories in Malaysia',
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
        text: 'Leadership development is the most levied soft skills category because the business case is clearest. Promoted technical experts who lack management skills cost companies far more in turnover and poor decisions than the cost of training. Look for programmes that cover coaching skills for managers, feedback frameworks, and situational leadership — not just theory-heavy MBA-lite content.',
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
        text: 'Business writing programmes are particularly high-ROI for organisations where email and report quality visibly affects client relationships. Claimable under SBL and SBL-Khas.',
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
          'Confirm the course is listed under the provider\'s HRD Corp registration — not all programmes from a registered provider are claimable',
        ],
      },
      {
        type: 'h2',
        text: 'Which grant scheme to use for soft skills',
      },
      {
        type: 'p',
        text: 'Most soft skills programmes qualify under SBL (Skim Bantuan Latihan). Leadership and communication programmes for managers and above often qualify under SBL-Khas, which has higher per-participant claim limits. When in doubt, ask the provider — they deal with eTRiS claims daily and know exactly which scheme applies.',
      },
      {
        type: 'h2',
        text: 'Browse soft skills training providers in Malaysia',
      },
      {
        type: 'p',
        text: 'FindTraining.com lists HRDF-registered training providers who specialise in soft skills, leadership, and professional development — all eligible for levy claims.',
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
        text: 'Yes — sales training is fully eligible for HRD Corp levy claims, provided it is delivered by a registered provider and the course is approved. This includes B2B sales methodology training, key account management, negotiation, retail sales, telemarketing, and sales leadership programmes. The levy rate is 1% of monthly wages for companies with 10 or more Malaysian employees (0.5% for smaller voluntary registrants).',
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
          '"Is this course registered under your HRD Corp licence — and which claim scheme does it fall under?"',
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
          'Sales training falls under SBL for most programmes — reimbursement after training is completed',
          'Structured multi-day programmes are more easily approved than half-day workshops',
          'In-house delivery for groups of 8+ is the most cost-effective structure for levy claims',
          'Confirm the specific course code is registered before committing to a provider',
          'Keep the training schedule fixed — changes after eTRiS submission require re-approval',
        ],
      },
      {
        type: 'h2',
        text: 'Find sales training providers in Malaysia',
      },
      {
        type: 'p',
        text: 'Browse FindTraining.com to find HRDF-registered sales training providers in Malaysia — filterable by delivery method, industry focus, and state.',
      },
    ],
  },
  {
    slug: 'hrdf-levy-vs-hrd-corp-explained',
    title: 'HRDF vs HRD Corp: What Changed and What It Means for Employers',
    description:
      'HRDF became HRD Corp in 2021. This guide explains what changed, what stayed the same, and how it affects your training levy and claims.',
    publishedAt: '2026-04-05',
    readingTimeMinutes: 5,
    category: 'HR Compliance',
    content: [
      {
        type: 'p',
        text: 'If you have been dealing with Malaysia\'s training levy system for more than a few years, you will have noticed the branding shift from HRDF to HRD Corp. It has caused persistent confusion — some HR managers still file under "HRDF" while others use "HRD Corp," and many are unsure whether the rules changed. This guide clears it up once and for all.',
      },
      {
        type: 'h2',
        text: 'What is HRDF?',
      },
      {
        type: 'p',
        text: 'HRDF stands for Human Resource Development Fund. It was the name of both the fund itself and the statutory body that administered it — officially registered as Perbadanan Pembangunan Sumber Manusia Berhad (PSMB) under the Ministry of Human Resources. The fund was established under the Pembangunan Sumber Manusia Berhad Act 2001 and made levy contributions mandatory for employers in covered sectors.',
      },
      {
        type: 'h2',
        text: 'What is HRD Corp?',
      },
      {
        type: 'p',
        text: 'HRD Corp — Human Resource Development Corporation — is the new trading name for the same statutory body (PSMB). The rebrand was announced and took effect in 2021 as part of a broader modernisation effort under the Malaysia Budget 2021 announcement. The legal entity, the act, the levy system, and the claims portal are all unchanged.',
      },
      {
        type: 'callout',
        text: 'HRDF = HRD Corp. Same body, same fund, same act, same portal. The rebrand was cosmetic. Your levy obligations and claim rights are identical.',
      },
      {
        type: 'h2',
        text: 'What actually changed in 2021',
      },
      {
        type: 'p',
        text: 'While the rebrand itself was cosmetic, 2021 did bring some substantive changes that employers should know about:',
      },
      {
        type: 'ul',
        items: [
          'Expanded sector coverage — more industries are now mandatory registrants under the PSMB (Amendment) Act 2021',
          'Gig economy inclusion — platform workers and certain freelancers are now eligible to access levy-funded training',
          'Foreign-owned companies — companies with foreign ownership above certain thresholds must now register if they meet the employee threshold',
          'New grant schemes — SBL-Khas was expanded to cover more digital economy and strategic skills categories',
          'Employer training plan submission — HRD Corp now encourages (and for some schemes, requires) annual training plans submitted via eTRiS',
        ],
      },
      {
        type: 'h2',
        text: 'Who must register — and has this changed?',
      },
      {
        type: 'p',
        text: 'The basic registration threshold is unchanged: employers in covered sectors with 10 or more Malaysian employees must register and pay the 1% levy. Employers with 5 to 9 employees may register voluntarily at 0.5%. The post-2021 change is that more sectors now fall under the covered categories — check the updated Second Schedule of the Act if you are in agriculture, education, or healthcare, which were historically excluded.',
      },
      {
        type: 'h2',
        text: 'The eTRiS portal: same system, new name',
      },
      {
        type: 'p',
        text: 'The claims portal previously referenced as the "HRDF portal" is now branded as eTRiS (e-Training Information System) at etris.hrdcorp.gov.my. If you have bookmarked old HRDF portal URLs, these now redirect to the HRD Corp domain. Your login credentials, levy balance, and claim history carry over — there was no re-registration required.',
      },
      {
        type: 'h2',
        text: 'Do training providers need to re-register as "HRD Corp" providers?',
      },
      {
        type: 'p',
        text: 'No. Training providers who were HRDF-registered remained registered under HRD Corp automatically. Their provider registration numbers are the same. Courses approved under HRDF remain claimable under HRD Corp. New providers register through the same eTRiS portal under the new HRD Corp branding.',
      },
      {
        type: 'h2',
        text: 'Why "HRDF" is still widely used',
      },
      {
        type: 'p',
        text: 'Despite the official rebrand, "HRDF" remains the dominant term in job postings, HR job descriptions, training provider marketing, and Google searches across Malaysia. This is normal for established institutional brands — people use the name they learned first. For practical purposes, the two terms are interchangeable. When communicating with HRD Corp officially, use "HRD Corp." In everyday HR conversations, either term is understood.',
      },
      {
        type: 'h2',
        text: 'Key takeaways for employers',
      },
      {
        type: 'ul',
        items: [
          'HRDF and HRD Corp are the same body — the rebrand happened in 2021',
          'Your levy rate, payment deadlines, and claims process are unchanged',
          'More sectors now face mandatory registration post-2021 — verify if you are newly covered',
          'eTRiS is the correct portal — etris.hrdcorp.gov.my',
          'Your old provider relationships and course approvals remain valid',
          'SBL-Khas has expanded scope — check if your planned training now qualifies',
        ],
      },
      {
        type: 'h2',
        text: 'Find HRD Corp registered training providers',
      },
      {
        type: 'p',
        text: 'Whether you call it HRDF or HRD Corp, FindTraining.com lists every registered training provider in Malaysia so you can find claimable courses faster.',
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
        text: 'Most HR managers in Malaysia leave training budget planning to the last quarter — and end up scrambling to spend unallocated levy before it lapses or rushing low-quality training through eTRiS just to hit utilisation targets. A structured annual training budget, built around HRD Corp levy strategy, eliminates this cycle. Here is how to do it properly.',
      },
      {
        type: 'h2',
        text: 'Understand your levy balance and contribution rate first',
      },
      {
        type: 'p',
        text: 'Before you plan a single programme, know your numbers. Log into eTRiS and check your current levy balance and your average monthly contribution. This tells you your annual training "budget" from HRD Corp before any top-up from your own budget.',
      },
      {
        type: 'ul',
        items: [
          'Monthly levy = 1% of total monthly wages for Malaysian employees (0.5% if voluntary registrant)',
          'Annual levy accumulation = monthly levy × 12 (assuming payroll stays constant)',
          'Current balance = accumulated contributions minus claims already approved',
          'Unutilised levy does not roll forward indefinitely — HRD Corp can recoup unclaimed balances',
          'Your own training budget (outside levy) should be planned separately but coordinated with levy usage',
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
          'Tier 1 — Mandatory & compliance: safety training, HRDF-required courses, regulatory certifications. Book first, ring-fence budget.',
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
        text: 'Different courses qualify under different HRD Corp schemes, which affects how much you can claim and when reimbursement arrives. Map each programme to its scheme before committing:',
      },
      {
        type: 'ul',
        items: [
          'SBL — standard reimbursement after training, suitable for most courses',
          'SBL-Khas — higher claim limits for strategic digital and leadership programmes, requires pre-approval',
          'HRDF e-LATiH — for online and e-learning programmes listed on the platform',
          'IBL — for structured on-the-job training within your own organisation',
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
          'Planning training without checking eTRiS levy balance first — leading to over-budgeting',
          'Booking training with unregistered providers, then discovering it is not claimable',
          'Submitting SBL-Khas claims after training starts — pre-approval is required',
          'Allocating most levy to one department while others have urgent skill gaps',
          'No training plan submitted to HRD Corp — some schemes require an annual plan for faster approval',
          'Failing to keep attendance sheets and certificates — claims fail at document upload',
        ],
      },
      {
        type: 'h2',
        text: 'Find training providers for your annual plan',
      },
      {
        type: 'p',
        text: 'Use FindTraining.com to identify HRD Corp-registered providers for every training category in your annual plan — from compliance to leadership to digital skills. Use the HRDF levy calculator to estimate your annual levy contribution.',
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
        text: 'Most HR managers in Malaysia have a procurement playbook for office supplies but no equivalent for training providers. The result is that the choice tends to default to whoever Patrick from finance worked with two years ago. This guide gives you a seven-step framework you can use on every training procurement — from levy-claimable HRD Corp courses through to leadership development engagements.',
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
        text: 'For levy-claimable training, the provider must be HRD Corp-registered and the course must be approved on the eTRiS system. Both conditions are necessary — provider registration alone does not guarantee that a specific course is claimable. Always ask for the eTRiS course code in writing before signing.',
      },
      {
        type: 'h2',
        text: 'Step 3 — Shortlist three to five providers, not more',
      },
      {
        type: 'p',
        text: 'A shortlist of three to five gives you enough comparison without burning weeks on procurement. Use category and state filters on findtraining.com to surface candidates. For specialist categories — for example sales training or technical certifications — the eligible pool is small enough that five is realistic. For generic categories like soft skills, narrow the shortlist using "delivery method" and "HRDF-verified" filters.',
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
          'eTRiS course code (for HRDF-claimable courses)',
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
        text: 'Build a simple weighted scoresheet: 40% trainer fit (relevant experience to your outcome), 25% delivery method fit (in-person / hybrid / virtual matching your team\'s reality), 20% references (do they describe outcomes or content?), 15% price. Avoid scoring price > 25% — the cheapest training delivers no outcome change, and the levy reimbursement neutralises a lot of the price spread anyway.',
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
        text: 'Use findtraining.com to build the Step-3 shortlist — filter by category, state, delivery method, and HRDF status, then send the same Step-4 question set to each provider. The directory is free for buyers; we earn from the provider side when they upgrade their listing.',
      },
    ],
  },
  {
    slug: 'corporate-training-cost-malaysia-2026',
    title: 'How Much Does Corporate Training Cost in Malaysia? A 2026 Buyer\'s Guide',
    description:
      'Realistic price ranges for HRDF-claimable corporate training in Malaysia — by category, delivery method, and engagement size. Plus what drives the spread.',
    publishedAt: '2026-05-23',
    readingTimeMinutes: 6,
    category: 'Buyer Guide',
    content: [
      {
        type: 'p',
        text: 'Pricing for corporate training in Malaysia is opaque because providers usually only quote on RFP. This guide gives you typical ranges so you can recognise an outlier — too high or too low — when one lands in your inbox. All figures are 2026 market observations, expressed as RM and per cohort unless stated otherwise.',
      },
      {
        type: 'callout',
        text: 'These ranges are observed market values, not official rates. The HRD Corp levy reimburses most of these costs for registered employers — see /tools/hrdf-calculator for your annual levy estimate.',
      },
      {
        type: 'h2',
        text: 'Per-pax pricing — soft skills and short courses',
      },
      {
        type: 'p',
        text: 'For one or two-day open-enrolment courses in Kuala Lumpur — communication skills, time management, presentation skills, basic leadership — typical per-pax pricing is RM 700 to RM 1,800. The wider end of the spread is for branded methodologies (e.g. Crucial Conversations, Situational Leadership) where the licence fee inflates the price.',
      },
      {
        type: 'h2',
        text: 'Per-cohort pricing — in-house delivery',
      },
      {
        type: 'p',
        text: 'In-house delivery for a closed cohort of 12 to 20 participants is usually the better deal once you have more than 8 attendees. Typical day-rates in 2026:',
      },
      {
        type: 'ul',
        items: [
          'Soft skills / communication / general leadership — RM 4,500 to RM 8,000 per day',
          'Sales training — RM 6,000 to RM 14,000 per day (higher for branded methodologies)',
          'Technical / IT certifications — RM 5,500 to RM 12,000 per day depending on vendor exam fees',
          'Senior leadership / executive coaching — RM 8,000 to RM 25,000 per day for experienced trainers',
          'Compliance / safety mandatory — RM 3,500 to RM 6,500 per day',
        ],
      },
      {
        type: 'h2',
        text: 'Multi-day and multi-cohort engagements',
      },
      {
        type: 'p',
        text: 'For programmes of 4+ days or 3+ cohorts within a quarter, providers typically discount 10–20% off the headline day rate. Some negotiate a single fixed programme fee instead of day-rate billing. If you are buying training as a recurring commitment, ask for a framework agreement with locked rates for 12 months.',
      },
      {
        type: 'h2',
        text: 'Hidden costs to ask about up front',
      },
      {
        type: 'ul',
        items: [
          'Materials — branded methodology workbooks, assessment licences, certification fees',
          'Venue — included or excluded; for off-site, hotel meeting rooms in KL range RM 1,200 to RM 3,500 per day for groups of 20',
          'F&B — typically RM 60 to RM 120 per pax per day at hotel venues',
          'Trainer travel — for trainings outside KL or for non-local trainers',
          'Post-training assessments / coaching follow-ups',
          'Cancellation policy — usually 14–21 day window before full charge',
        ],
      },
      {
        type: 'h2',
        text: 'Virtual vs. in-person',
      },
      {
        type: 'p',
        text: 'Virtual delivery typically reduces price by 25–40% — no venue, no F&B, lower trainer day rate (no travel/time-on-the-road). For genuine learning outcomes, virtual works well for technical and content-heavy programmes but underperforms for behavioural / soft-skills outcomes where peer practice in the room is part of the value.',
      },
      {
        type: 'h2',
        text: 'How HRD Corp levy claims affect net cost',
      },
      {
        type: 'p',
        text: 'For HRD Corp-registered employers, claimable training is reimbursed against your levy contribution. The headline price you pay the provider is the same; the levy claim is filed separately through eTRiS post-delivery. Net cost to the employer is the levy not yet reimbursed plus any non-claimable elements (e.g. T&E above the eligible cap).',
      },
      {
        type: 'h2',
        text: 'How FindTraining helps',
      },
      {
        type: 'p',
        text: 'Use findtraining.com to identify three to five providers in your category, ask each for an itemised quote against the same scope, and compare like for like. The HRDF levy calculator at /tools/hrdf-calculator gives you the upper envelope of what your employer can spend reimbursable.',
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
        text: 'Sales: findtraining.com/categories/sales-marketing. Leadership: findtraining.com/categories/leadership-management. Both lists are filterable by state, delivery method, and HRDF-claimable status. For combined sales-and-leadership engagements ("salesforce effectiveness", "revenue enablement"), search for those phrases.',
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
        text: 'For HRDF-registered employers, this is the metric finance directors actually ask about: of the annual levy contribution, what percentage is being claimed back through training? Levy utilisation below 60% is wasted; above 90% is exemplary. Track quarterly and report against the annual levy contribution estimate (see /tools/hrdf-calculator).',
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
