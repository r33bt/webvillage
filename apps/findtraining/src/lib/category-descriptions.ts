// src/lib/category-descriptions.ts
// Rich SEO descriptions for each FindTraining category.
// Keyed by the ft_categories.slug value from the database.

export interface CategoryDescription {
  headline: string
  intro: string
  keyPoints: string[]
  learnMoreSlug?: string
}

export const categoryDescriptions: Record<string, CategoryDescription> = {
  'it-training': {
    headline: 'IT & Technology Training Providers in Malaysia',
    intro:
      'IT and technology training covers everything from software development and cybersecurity to cloud infrastructure and data analytics. These courses equip Malaysian employees with in-demand technical skills that drive digital transformation.',
    keyPoints: [
      'Microsoft, CompTIA, Cisco, and AWS certification courses',
      'Courses available in cloud computing, cybersecurity, data science, and AI',
      'On-site, virtual live, and self-paced e-learning delivery options',
      'Suitable for technical staff, IT departments, and non-technical managers undergoing digital upskilling',
    ],
    learnMoreSlug: 'best-it-training-providers-malaysia-2026',
  },

  'leadership-management': {
    headline: 'Leadership & Management Training Providers in Malaysia',
    intro:
      'Leadership and management training develops the strategic thinking, people management, and decision-making capabilities that organisations need to grow. From first-time manager programmes to C-suite executive development, Providers here help Malaysian HR teams build a stronger leadership pipeline.',
    keyPoints: [
      'Programmes from supervisory skills to senior executive coaching',
      'Topics include strategic planning, change management, and high-performance team building',
      'Many providers offer blended cohort learning with in-company customisation',
    ],
  },

  'human-resources': {
    headline: 'Human Resources Training Providers in Malaysia',
    intro:
      'HR training helps practitioners stay current with Malaysian employment law, best-practice talent management, and modern people analytics. Whether your HR team needs to master payroll compliance, performance appraisal frameworks, or HRD Corp levy and grant administration, these providers deliver practical, Malaysia-specific content.',
    keyPoints: [
      'Covers Employment Act 1955 updates, PCB/payroll compliance, and IR procedures',
      'Talent acquisition, competency-based interviewing, and onboarding best practices',
      'Performance management, KPI design, and 360-degree feedback methodologies',
      'HRD Corp levy and grant administration workshops',
    ],
  },

  'finance-accounting': {
    headline: 'Finance & Accounting Training Providers in Malaysia',
    intro:
      'Finance and accounting training keeps your team current with Malaysian tax law, MFRS accounting standards, and financial management best practices. From executive financial literacy to advanced audit and compliance skills, providers offer courses that directly improve business performance and regulatory readiness.',
    keyPoints: [
      'SST and tax compliance courses',
      'MFRS and IFRS accounting standards training for finance teams',
      'Courses in financial modelling, budgeting, and management accounting',
      'ACCA, CIMA, and MIA-recognised CPD programmes available',
    ],
  },

  'safety-health': {
    headline: 'Safety & Health (NIOSH) Training Providers in Malaysia',
    intro:
      'Occupational safety and health training is both a legal requirement and a critical investment for Malaysian employers under the Occupational Safety and Health Act 1994. Certified NIOSH trainers and DOSH-accredited providers offer everything from Green Book certification to HIRARC facilitation.',
    keyPoints: [
      'NIOSH Green Book and site safety supervisor certification programmes',
      'HIRARC (Hazard Identification, Risk Assessment, and Risk Control) workshops',
      'Fire safety officer courses and emergency response planning',
      'Construction, manufacturing, and chemical industries specialisation available',
    ],
  },

  'sales-marketing': {
    headline: 'Sales & Marketing Training Providers in Malaysia',
    intro:
      'Sales and marketing training equips Malaysian teams with the skills to close deals, retain customers, and grow revenue in a competitive market. Providers cover everything from consultative B2B sales and CRM platforms to digital marketing strategy and brand management.',
    keyPoints: [
      'B2B solution selling, negotiation, and key account management techniques',
      'Digital marketing: SEO, social media, Google Ads, and email automation',
      'Sales coaching and territory management for frontline sales teams',
      'CRM platform training (Salesforce, HubSpot) available with select providers',
    ],
    learnMoreSlug: 'sales-training-providers-malaysia',
  },

  'customer-service': {
    headline: 'Customer Service Training Providers in Malaysia',
    intro:
      'Customer service training builds the communication, empathy, and problem-solving skills that separate average service from exceptional experiences. Malaysian HR teams use these providers to upskill frontline staff, call centre agents, and service managers in handling complaints, building rapport, and driving customer loyalty.',
    keyPoints: [
      'Service excellence and customer experience (CX) frameworks',
      'Complaint handling, de-escalation, and difficult customer management',
      'Call centre operations, scripting, and quality assurance training',
      'Programmes available in English and Bahasa Malaysia',
    ],
  },

  'soft-skills': {
    headline: 'Soft Skills Training Providers in Malaysia',
    intro:
      'Soft skills training develops the interpersonal and professional capabilities that make technical expertise effective — communication, presentation, critical thinking, and emotional intelligence. Malaysian organisations use soft skills providers to prepare employees for leadership, client-facing roles, and cross-functional collaboration.',
    keyPoints: [
      'Business communication, report writing, and executive presentation skills',
      'Emotional intelligence (EQ), conflict resolution, and workplace relationship management',
      'Time management, productivity, and personal effectiveness programmes',
      'Customisable workshops available for intact teams or organisation-wide rollout',
    ],
    learnMoreSlug: 'hrdf-approved-soft-skills-training-malaysia',
  },

  'compliance-legal': {
    headline: 'Compliance & Legal Training Providers in Malaysia',
    intro:
      'Compliance and legal training helps Malaysian businesses stay on the right side of an increasingly complex regulatory landscape. From PDPA data protection and AML obligations to corporate governance and employment law, providers deliver targeted training that reduces organisational risk.',
    keyPoints: [
      'PDPA 2010 (Malaysia Personal Data Protection Act) compliance workshops',
      'Anti-money laundering (AML) and Know Your Customer (KYC) certification',
      'Employment Act, Industrial Relations Act, and HR legal compliance',
      'Corporate governance, ethics, and whistleblower protection programmes',
    ],
  },

  'technical-skills': {
    headline: 'Technical & Engineering Training Providers in Malaysia',
    intro:
      'Technical and engineering training addresses the specialised skills gap in Malaysian manufacturing, construction, and industrial sectors. Providers offer hands-on programmes in maintenance engineering, quality management, and advanced manufacturing techniques.',
    keyPoints: [
      'Electrical, mechanical, and instrumentation maintenance training',
      'ISO 9001, ISO 14001, and ISO 45001 implementation and internal auditing',
      'Lean manufacturing, Six Sigma (Yellow/Green/Black Belt), and Kaizen facilitation',
      'AutoCAD, SolidWorks, and industrial automation certifications available',
    ],
  },

  'hospitality-tourism': {
    headline: 'Hospitality & Tourism Training Providers in Malaysia',
    intro:
      'Hospitality and tourism training prepares Malaysian hotel, F&B, and travel industry professionals for service excellence in a globally competitive market. Providers offer practical skills development across front office operations, food and beverage service, tour guiding, and hospitality management.',
    keyPoints: [
      'Front office, housekeeping, and F&B service operations training',
      'Tourism product knowledge, tour planning, and guide certification',
      'Revenue management, yield optimisation, and OTA channel management',
      'Programmes aligned with Malaysian Tourism Standards (MaTSA) where applicable',
    ],
  },

  'healthcare': {
    headline: 'Healthcare Training Providers in Malaysia',
    intro:
      'Healthcare training develops the clinical, administrative, and interpersonal skills of Malaysia\'s healthcare workforce. Providers serve private hospital groups, clinic networks, and allied health employers — offering everything from clinical skills updates and medical billing to patient communication and healthcare management.',
    keyPoints: [
      'Clinical skills updates, infection control, and patient safety programmes',
      'Medical billing, coding, and private healthcare administration',
      'Patient communication, empathy, and service standards for healthcare staff',
      'Healthcare management and leadership for department heads and senior nurses',
    ],
  },

  'manufacturing': {
    headline: 'Manufacturing & Quality Training Providers in Malaysia',
    intro:
      'Manufacturing and quality training helps Malaysian production teams reduce waste, maintain certifications, and continuously improve processes. From ISO certification support to lean and Six Sigma implementation, providers equip shop floor and management personnel with skills that directly impact output quality and operational efficiency.',
    keyPoints: [
      'ISO 9001:2015, IATF 16949, and AS9100 quality management system training',
      'Lean manufacturing, 5S, Total Productive Maintenance (TPM), and Kaizen',
      'Six Sigma Yellow, Green, and Black Belt programmes with project facilitation',
      'Statistical Process Control (SPC), FMEA, and root cause analysis workshops',
    ],
  },
}
