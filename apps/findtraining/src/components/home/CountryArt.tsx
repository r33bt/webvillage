/**
 * CountryArt: one ink-line landmark per country hub (VISUAL-KIT.md A9: ink line + brand fills, objects and
 * buildings only, no people). Used on the homepage "Browse by country" cards.
 */

const INK = '#0F172A'
const BLUE = '#0F6FEC'
const BLUE_LIGHT = '#EBF3FE'
const TEAL = '#00C48C'
const TEAL_LIGHT = '#E0FBF4'

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full max-h-40" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
    </svg>
  )
}

function Malaysia() {
  // Twin towers with the skybridge
  return (
    <Frame>
      <circle cx="196" cy="34" r="12" fill={TEAL} />
      <path d="M80 140V64h30v76M84 64V44h22v20M88 44V30h14v14M95 30V10" fill="#fff" />
      <path d="M130 140V64h30v76M134 64V44h22v20M138 44V30h14v14M145 30V10" fill="#fff" />
      <rect x="110" y="82" width="20" height="7" fill={BLUE} />
      <path d="M86 78h18M86 96h18M86 114h18M136 78h18M136 96h18M136 114h18" strokeWidth="1.5" />
      <path d="M28 140h184" />
      <path d="M40 140v-26h24v26M176 140v-34h22v34" fill={BLUE_LIGHT} />
    </Frame>
  )
}

function Singapore() {
  // Three towers carrying the sky park, over the bay
  return (
    <Frame>
      <circle cx="40" cy="32" r="11" fill={TEAL} />
      <path d="M46 52h152l-8 9H54z" fill={BLUE_LIGHT} />
      <path d="M64 61l4 66h22l2-66M110 61l3 66h22l3-66M156 61l3 66h22l3-66" fill="#fff" />
      <path d="M74 80h12M74 98h12M120 80h12M120 98h12M166 80h12M166 98h12" strokeWidth="1.5" />
      <path d="M28 127h184" />
      <path d="M40 136h40M100 136h56M176 136h30M60 144h44M130 144h50" stroke={BLUE} strokeWidth="1.5" />
    </Frame>
  )
}

function UnitedKingdom() {
  // Clock tower beside the low parliament range
  return (
    <Frame>
      <path d="M100 140V44h32v96" fill="#fff" />
      <path d="M100 44l16-32 16 32z" fill={BLUE_LIGHT} />
      <circle cx="116" cy="62" r="10" fill={TEAL_LIGHT} />
      <path d="M116 62v-6M116 62l5 3" />
      <path d="M106 84h20M106 100h20M106 116h20" strokeWidth="1.5" />
      <path d="M132 140V92h76v48M40 140V104h60" fill="#fff" />
      <path d="M140 92v-8M156 92v-8M172 92v-8M188 92v-8M204 92v-8M48 104v-8M64 104v-8M80 104v-8" />
      <path d="M142 104v28M158 104v28M174 104v28M190 104v28M52 114v18M68 114v18M84 114v18" stroke={BLUE} strokeWidth="1.5" />
      <path d="M28 140h184" />
    </Frame>
  )
}

function Australia() {
  // Opera house sails on the harbour
  return (
    <Frame>
      <circle cx="196" cy="30" r="11" fill={TEAL} />
      <path d="M58 118c6-40 26-62 50-70-4 26-6 50-2 70z" fill="#fff" />
      <path d="M96 118c8-48 34-74 62-80-6 30-8 58-4 80z" fill={TEAL_LIGHT} />
      <path d="M144 118c6-34 22-52 42-58-4 22-4 42-2 58z" fill="#fff" />
      <path d="M48 118h150v12H48z" fill={BLUE_LIGHT} />
      <path d="M28 130h184" />
      <path d="M40 138h48M110 138h60M70 145h52M150 145h40" stroke={BLUE} strokeWidth="1.5" />
    </Frame>
  )
}

function UnitedStates() {
  // Domed capitol
  return (
    <Frame>
      <path d="M44 140v-34h152v34" fill="#fff" />
      <path d="M36 106h168l-10-10H46z" fill={BLUE_LIGHT} />
      <path d="M58 112v24M74 112v24M90 112v24M150 112v24M166 112v24M182 112v24" stroke={BLUE} strokeWidth="1.5" />
      <path d="M92 96V84h56v12" fill="#fff" />
      <path d="M94 84c0-26 12-40 26-40s26 14 26 40z" fill={TEAL_LIGHT} />
      <path d="M114 44V32h12v12M120 32v-12" fill="#fff" />
      <path d="M104 114h32v26h-32z" fill={BLUE_LIGHT} />
      <path d="M28 140h184" />
    </Frame>
  )
}

const ART: Record<string, () => JSX.Element> = {
  MY: Malaysia,
  SG: Singapore,
  GB: UnitedKingdom,
  AU: Australia,
  US: UnitedStates,
}

export function CountryArt({ code }: { code: string }) {
  const Art = ART[code]
  return Art ? <Art /> : null
}
