// HRD Corp primary pages that the HRDF tools cite. Each rule shown on the
// tools links to one of these. Rules were checked against these pages on
// 2026-10-21 (spec: _command-center/research/directory-playbook-2026-10/
// findtraining-hrdf-spec.md, section 4.1). Do not add a rule without a
// source here.
export const HRDF_SOURCES = {
  // Compulsory at 10+ Malaysian employees (1%); optional at 5 to 9 (0.5%)
  registeredEmployers: 'https://hrdcorp.gov.my/registered-employers/',
  // Levy formula, who counts as an employee, due dates, lower of approved or actual
  faq: 'https://hrdcorp.gov.my/faq/',
  // Industries covered, bodies not covered
  coverage: 'https://hrdcorp.gov.my/expansion-of-psmb-act-2001/',
  // HRD Corp Claimable Courses (the main scheme)
  hcc: 'https://hrdcorp.gov.my/hrdcorp-claimable-courses/',
  // Skim Bantuan Latihan (employer pays, then claims)
  sbl: 'https://hrdcorp.gov.my/skim-bantuan-latihan-sbl/',
} as const
