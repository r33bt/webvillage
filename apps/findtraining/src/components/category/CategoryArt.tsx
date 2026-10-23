/**
 * CategoryArt: one ink-line spot per training category (VISUAL-KIT.md A9: ink line + brand fills, objects only,
 * no people, no figures). Keyed by ft_categories.slug; any other slug gets the generic course drawing.
 */

const INK = '#0F172A'
const BLUE = '#0F6FEC'
const BLUE_DARK = '#0A52B8'
const BLUE_LIGHT = '#EBF3FE'
const TEAL = '#00C48C'
const TEAL_LIGHT = '#E0FBF4'

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 184h272" />
        {children}
      </g>
    </svg>
  )
}

const ART: Record<string, () => JSX.Element> = {
  'it-training': () => (
    <Frame>
      <rect x="70" y="34" width="150" height="104" rx="8" fill="#fff" />
      <rect x="82" y="46" width="126" height="78" rx="3" fill={BLUE_LIGHT} />
      <path d="M118 70l-14 15 14 15M172 70l14 15-14 15M152 64l-14 42" stroke={BLUE} strokeWidth="3" />
      <path d="M128 138l-6 30h46l-6-30M108 172h74" fill="#fff" />
      <rect x="232" y="122" width="34" height="56" rx="6" fill={TEAL_LIGHT} />
      <path d="M242 136h14M242 148h14" />
      <circle cx="249" cy="166" r="3" fill={INK} />
    </Frame>
  ),
  'leadership-management': () => (
    <Frame>
      <path d="M40 184l70-96 40 50 30-36 70 82z" fill={BLUE_LIGHT} />
      <path d="M180 102V30" />
      <path d="M180 30h52l-12 14 12 14h-52" fill={TEAL} />
      <circle cx="96" cy="58" r="22" fill="#fff" />
      <path d="M96 42l6 16-6 16-6-16z" fill={BLUE} stroke={BLUE_DARK} />
      <path d="M96 36v-4M96 84v-4M74 58h4M114 58h4" />
    </Frame>
  ),
  'finance-accounting': () => (
    <Frame>
      <path d="M48 40h112v144H48z" fill="#fff" />
      <path d="M48 40h112v20H48z" fill={BLUE_LIGHT} />
      <path d="M62 80h84M62 98h84M62 116h60M62 134h76" />
      <path d="M62 160h84M62 166h84" stroke={TEAL} />
      <rect x="180" y="64" width="90" height="120" rx="10" fill="#fff" />
      <rect x="194" y="78" width="62" height="26" rx="4" fill={TEAL_LIGHT} />
      <path d="M196 120h12v10h-12zM218 120h12v10h-12zM240 120h12v10h-12zM196 142h12v10h-12zM218 142h12v10h-12z" />
      <path d="M240 142h12v28h-12z" fill={BLUE} stroke={BLUE} />
      <path d="M196 164h34" />
    </Frame>
  ),
  'safety-health': () => (
    <Frame>
      <path d="M60 132c0-46 30-72 66-72s66 26 66 72z" fill={TEAL} />
      <path d="M46 132h160v14H46z" fill="#fff" />
      <path d="M126 60v-8M110 64l6 30M142 64l-6 30" />
      <rect x="216" y="104" width="68" height="80" rx="8" fill="#fff" />
      <path d="M236 104v-12h28v12" />
      <path d="M244 132h12v-12h8v12h12v8h-12v12h-8v-12h-12z" fill={BLUE} stroke={BLUE_DARK} strokeWidth="1.5" />
    </Frame>
  ),
  'human-resources': () => (
    <Frame>
      <path d="M120 20l30 50M200 20l-30 50" stroke={BLUE} strokeWidth="3" />
      <rect x="120" y="70" width="80" height="104" rx="10" fill="#fff" />
      <rect x="146" y="64" width="28" height="12" rx="4" fill={BLUE_LIGHT} />
      <circle cx="160" cy="108" r="16" fill={TEAL_LIGHT} />
      <path d="M138 140h44M144 154h32" />
      <path d="M44 120h56v64H44z" fill={BLUE_LIGHT} />
      <path d="M44 120l10-12h24l6 12" fill="#fff" />
      <path d="M232 110h48v74h-48z" fill="#fff" />
      <path d="M242 128h28M242 142h28M242 156h18" />
    </Frame>
  ),
  'sales-marketing': () => (
    <Frame>
      <path d="M60 104h30l70-40v104l-70-40H60z" fill="#fff" />
      <path d="M72 128l10 40h20l-8-40" fill={BLUE_LIGHT} />
      <path d="M180 92c10 8 10 24 0 32M196 80c18 14 18 42 0 56" stroke={BLUE} strokeWidth="3" />
      <path d="M222 52h56v56l-44 44-56-56z" fill={TEAL_LIGHT} />
      <circle cx="262" cy="68" r="7" fill="#fff" />
      <path d="M214 100l26 26M228 88l26 26" />
    </Frame>
  ),
  'customer-service': () => (
    <Frame>
      <path d="M70 120a50 50 0 0 1 100 0" />
      <rect x="58" y="112" width="24" height="44" rx="8" fill={BLUE} stroke={BLUE_DARK} />
      <rect x="158" y="112" width="24" height="44" rx="8" fill={BLUE} stroke={BLUE_DARK} />
      <path d="M170 156c0 14-16 20-34 20" />
      <rect x="124" y="170" width="16" height="10" rx="4" fill={TEAL} />
      <path d="M204 40h80v50h-50l-18 16v-16h-12z" fill="#fff" />
      <path d="M218 58h52M218 72h34" />
      <path d="M214 120h60v36h-14v14l-14-14h-32z" fill={TEAL_LIGHT} />
    </Frame>
  ),
  'soft-skills': () => (
    <Frame>
      <path d="M40 40h120v70H96l-24 22v-22H40z" fill="#fff" />
      <path d="M56 62h88M56 80h60" />
      <path d="M150 92h130v70h-32v22l-24-22h-74z" fill={BLUE_LIGHT} />
      <path d="M168 116h94M168 134h70" />
      <path d="M232 30h26a8 8 0 0 1 16 0h12v26a8 8 0 0 0 0 16v12h-54z" fill={TEAL} />
    </Frame>
  ),
  'compliance-legal': () => (
    <Frame>
      <path d="M160 30v138M120 184h80M110 168h100" />
      <path d="M90 60h140" />
      <path d="M90 60l-28 62h56zM230 60l-28 62h56z" />
      <path d="M62 122a28 12 0 0 0 56 0z" fill={TEAL_LIGHT} />
      <path d="M202 122a28 12 0 0 0 56 0z" fill={BLUE_LIGHT} />
      <circle cx="160" cy="30" r="8" fill={BLUE} stroke={BLUE_DARK} />
    </Frame>
  ),
  'technical-skills': () => (
    <Frame>
      <circle cx="210" cy="96" r="44" fill={BLUE_LIGHT} />
      <circle cx="210" cy="96" r="16" fill="#fff" />
      <path d="M210 52V38M210 140v14M166 96h-14M254 96h14M179 65l-10-10M241 127l10 10M241 65l10-10M179 127l-10 10" strokeWidth="8" />
      <path d="M60 172l70-70" strokeWidth="12" stroke={INK} />
      <path d="M60 172l70-70" strokeWidth="7" stroke={TEAL} />
      <path d="M128 78a22 22 0 1 0 26 26l-14-4-6-6z" fill="#fff" />
    </Frame>
  ),
  'hospitality-tourism': () => (
    <Frame>
      <path d="M40 150a60 60 0 0 1 120 0z" fill="#fff" />
      <path d="M30 150h140v10H30z" fill={BLUE_LIGHT} />
      <circle cx="100" cy="84" r="7" fill={TEAL} />
      <rect x="196" y="84" width="88" height="100" rx="10" fill={TEAL_LIGHT} />
      <path d="M222 84V66h36v18M196 120h88" />
      <path d="M212 184v-6M268 184v-6" />
    </Frame>
  ),
  healthcare: () => (
    <Frame>
      <rect x="178" y="40" width="96" height="140" rx="8" fill="#fff" />
      <rect x="204" y="32" width="44" height="18" rx="5" fill={BLUE_LIGHT} />
      <path d="M194 80h64M194 98h64M194 116h40" />
      <path d="M216 140h10v-10h10v10h10v10h-10v10h-10v-10h-10z" fill={TEAL} stroke={TEAL} strokeWidth="1.5" />
      <path d="M66 40v50a30 30 0 0 0 60 0V40" />
      <path d="M96 120v24a26 26 0 0 0 52 0v-18" />
      <circle cx="148" cy="118" r="10" fill={BLUE} stroke={BLUE_DARK} />
      <path d="M58 40h16M118 40h16" strokeWidth="5" />
    </Frame>
  ),
  manufacturing: () => (
    <Frame>
      <path d="M40 184V100l50 30v-30l50 30v-30l50 30V60h30v124z" fill="#fff" />
      <path d="M190 60h30v-20h-30z" fill={BLUE_LIGHT} />
      <path d="M60 150h18v18H60zM106 150h18v18h-18zM152 150h18v18h-18z" fill={TEAL_LIGHT} />
      <path d="M232 160h56M236 176a6 6 0 1 0 0-.1M284 176a6 6 0 1 0 0-.1" />
      <rect x="240" y="132" width="24" height="24" rx="3" fill={BLUE} stroke={BLUE_DARK} />
      <path d="M206 34c4-8 14-8 18-16" />
    </Frame>
  ),
}

function CourseArt() {
  return (
    <Frame>
      <path d="M70 60h80v120H70zM150 60h80v120h-80z" fill="#fff" />
      <path d="M150 60c-4 40-4 80 0 120" />
      <path d="M84 86h52M84 104h52M84 122h36M164 86h52M164 104h44" />
      <path d="M240 50l30 30-80 80-36 6 6-36z" fill={TEAL_LIGHT} />
      <path d="M232 58l30 30" />
    </Frame>
  )
}

export function CategoryArt({ slug }: { slug: string }) {
  const Art = ART[slug] ?? CourseArt
  return <Art />
}
