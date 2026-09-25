// Hand-drawn SVG critters used for counting pictures, buddies and celebrations.
// Every critter lives in a 100×100 box and draws with a dark outline so it
// still reads clearly when a worksheet is printed in black and white.

const INK = '#3b2f2f'
const SW = 3

function Eyes({ y = 44, dx = 14, cx = 50, r = 5 }) {
  return (
    <g>
      <circle cx={cx - dx} cy={y} r={r} fill={INK} />
      <circle cx={cx + dx} cy={y} r={r} fill={INK} />
      <circle cx={cx - dx + 1.6} cy={y - 1.8} r={r * 0.36} fill="#fff" />
      <circle cx={cx + dx + 1.6} cy={y - 1.8} r={r * 0.36} fill="#fff" />
    </g>
  )
}

function Cheeks({ y = 58, dx = 25, color = '#ff9bb0' }) {
  return (
    <g opacity="0.7">
      <ellipse cx={50 - dx} cy={y} rx="6" ry="4" fill={color} />
      <ellipse cx={50 + dx} cy={y} rx="6" ry="4" fill={color} />
    </g>
  )
}

const Pig = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M22 30 L18 10 L38 20 Z" fill="#f7a8b8" />
    <path d="M78 30 L82 10 L62 20 Z" fill="#f7a8b8" />
    <circle cx="50" cy="54" r="36" fill="#fbc4cf" />
    <ellipse cx="50" cy="64" rx="15" ry="11" fill="#f59ab0" />
    <ellipse cx="44.5" cy="64" rx="3" ry="4.5" fill={INK} stroke="none" />
    <ellipse cx="55.5" cy="64" rx="3" ry="4.5" fill={INK} stroke="none" />
    <g stroke="none">
      <Eyes y={44} dx={15} />
      <Cheeks y={62} dx={27} color="#ff7f9c" />
    </g>
  </g>
)

const Cow = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M28 26 Q20 8 30 6 Q30 16 36 22 Z" fill="#f3e3c3" />
    <path d="M72 26 Q80 8 70 6 Q70 16 64 22 Z" fill="#f3e3c3" />
    <ellipse cx="14" cy="38" rx="12" ry="7" fill="#fff" transform="rotate(-20 14 38)" />
    <ellipse cx="86" cy="38" rx="12" ry="7" fill="#fff" transform="rotate(20 86 38)" />
    <ellipse cx="50" cy="48" rx="32" ry="34" fill="#fff" />
    <path d="M26 30 Q34 22 42 30 Q40 40 30 40 Q24 38 26 30 Z" fill={INK} stroke="none" />
    <path d="M66 50 Q76 44 80 54 Q76 62 68 58 Z" fill={INK} stroke="none" />
    <ellipse cx="50" cy="70" rx="24" ry="16" fill="#f7b6c2" />
    <ellipse cx="42" cy="70" rx="3.5" ry="4.5" fill={INK} stroke="none" />
    <ellipse cx="58" cy="70" rx="3.5" ry="4.5" fill={INK} stroke="none" />
    <g stroke="none">
      <Eyes y={44} dx={13} />
    </g>
  </g>
)

const Chick = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M50 14 Q46 4 52 6 Q54 10 50 14 Q58 6 60 10 Q56 14 50 14" fill="#ffd23f" />
    <path d="M40 88 L36 96 M40 88 L42 96 M60 88 L58 96 M60 88 L64 96" fill="none" stroke="#f28c28" />
    <circle cx="50" cy="54" r="36" fill="#ffe066" />
    <path d="M16 58 Q6 50 12 42 Q20 48 22 56 Z" fill="#ffd23f" />
    <path d="M84 58 Q94 50 88 42 Q80 48 78 56 Z" fill="#ffd23f" />
    <path d="M42 56 L58 56 L50 68 Z" fill="#f28c28" />
    <g stroke="none">
      <Eyes y={44} dx={14} />
      <Cheeks y={60} dx={24} />
    </g>
  </g>
)

const Frog = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <ellipse cx="50" cy="60" rx="40" ry="30" fill="#7fd06b" />
    <circle cx="30" cy="30" r="15" fill="#7fd06b" />
    <circle cx="70" cy="30" r="15" fill="#7fd06b" />
    <circle cx="30" cy="30" r="8" fill="#fff" />
    <circle cx="70" cy="30" r="8" fill="#fff" />
    <circle cx="31" cy="31" r="4.5" fill={INK} stroke="none" />
    <circle cx="71" cy="31" r="4.5" fill={INK} stroke="none" />
    <path d="M28 62 Q50 80 72 62" fill="none" />
    <g stroke="none">
      <Cheeks y={62} dx={30} />
      <circle cx="44" cy="50" r="1.8" fill={INK} />
      <circle cx="56" cy="50" r="1.8" fill={INK} />
    </g>
  </g>
)

const Bunny = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <ellipse cx="36" cy="22" rx="9" ry="22" fill="#eef0f4" />
    <ellipse cx="64" cy="22" rx="9" ry="22" fill="#eef0f4" />
    <ellipse cx="36" cy="24" rx="4" ry="14" fill="#ffc2d1" stroke="none" />
    <ellipse cx="64" cy="24" rx="4" ry="14" fill="#ffc2d1" stroke="none" />
    <circle cx="50" cy="60" r="32" fill="#eef0f4" />
    <path d="M46 64 L54 64 L50 69 Z" fill="#ff8fab" />
    <path d="M50 69 Q46 76 42 73 M50 69 Q54 76 58 73" fill="none" strokeWidth="2.4" />
    <g strokeWidth="1.6" fill="none">
      <path d="M36 66 L20 62 M36 70 L20 72 M64 66 L80 62 M64 70 L80 72" />
    </g>
    <g stroke="none">
      <Eyes y={52} dx={13} />
      <Cheeks y={66} dx={22} />
    </g>
  </g>
)

const Bear = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <circle cx="22" cy="26" r="13" fill="#b07a4f" />
    <circle cx="78" cy="26" r="13" fill="#b07a4f" />
    <circle cx="22" cy="26" r="6" fill="#e3b48a" stroke="none" />
    <circle cx="78" cy="26" r="6" fill="#e3b48a" stroke="none" />
    <circle cx="50" cy="54" r="36" fill="#c08a5c" />
    <ellipse cx="50" cy="66" rx="16" ry="12" fill="#ecc9a2" />
    <ellipse cx="50" cy="61" rx="6" ry="4.5" fill={INK} stroke="none" />
    <path d="M50 65 L50 70 M44 72 Q50 76 56 72" fill="none" strokeWidth="2.4" />
    <g stroke="none">
      <Eyes y={46} dx={15} />
    </g>
  </g>
)

const Cat = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M18 44 L20 8 L44 26 Z" fill="#f6a54a" />
    <path d="M82 44 L80 8 L56 26 Z" fill="#f6a54a" />
    <path d="M24 34 L25 18 L36 27 Z M76 34 L75 18 L64 27 Z" fill="#ffc9a8" stroke="none" />
    <ellipse cx="50" cy="56" rx="36" ry="32" fill="#f8b565" />
    <path d="M40 30 L44 40 M50 28 L50 38 M60 30 L56 40" fill="none" strokeWidth="2.6" />
    <path d="M46 60 L54 60 L50 65 Z" fill="#ff8fab" />
    <path d="M50 65 Q45 72 40 68 M50 65 Q55 72 60 68" fill="none" strokeWidth="2.4" />
    <g strokeWidth="1.6" fill="none">
      <path d="M34 62 L14 58 M34 66 L14 68 M66 62 L86 58 M66 66 L86 68" />
    </g>
    <g stroke="none">
      <Eyes y={50} dx={14} />
    </g>
  </g>
)

const Fish = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M70 50 L94 30 L90 50 L94 70 Z" fill="#ffa24c" />
    <ellipse cx="44" cy="50" rx="36" ry="26" fill="#ffc15e" />
    <path d="M40 26 Q50 12 62 28" fill="#ffa24c" />
    <path d="M48 36 Q56 50 48 64 M58 38 Q64 50 58 62" fill="none" strokeWidth="2.2" />
    <circle cx="24" cy="44" r="6" fill="#fff" />
    <circle cx="23" cy="44" r="3.4" fill={INK} stroke="none" />
    <path d="M12 58 Q16 62 22 60" fill="none" strokeWidth="2.4" />
  </g>
)

const Ladybug = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M40 22 Q34 8 26 10 M60 22 Q66 8 74 10" fill="none" />
    <circle cx="50" cy="28" r="16" fill={INK} />
    <circle cx="50" cy="58" r="34" fill="#ef4b4b" />
    <path d="M50 24 L50 92" fill="none" />
    <g fill={INK} stroke="none">
      <circle cx="33" cy="48" r="7" />
      <circle cx="67" cy="48" r="7" />
      <circle cx="30" cy="70" r="6" />
      <circle cx="70" cy="70" r="6" />
      <circle cx="44" cy="82" r="5" />
      <circle cx="56" cy="82" r="5" />
    </g>
    <circle cx="44" cy="26" r="3" fill="#fff" stroke="none" />
    <circle cx="56" cy="26" r="3" fill="#fff" stroke="none" />
  </g>
)

const Apple = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M50 26 Q52 12 58 6" fill="none" />
    <path d="M52 20 Q66 8 76 16 Q66 28 52 20 Z" fill="#7fd06b" />
    <path d="M50 28 Q30 16 16 34 Q6 56 22 80 Q34 96 50 86 Q66 96 78 80 Q94 56 84 34 Q70 16 50 28 Z" fill="#ef4b4b" />
    <path d="M26 42 Q24 50 28 56" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
  </g>
)

const Star = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z" fill="#ffd23f" />
    <g stroke="none">
      <Eyes y={50} dx={9} r={3.6} />
    </g>
    <path d="M44 60 Q50 66 56 60" fill="none" strokeWidth="2.4" />
  </g>
)

const Balloon = () => (
  <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <path d="M50 78 Q46 88 52 96" fill="none" strokeWidth="2" />
    <ellipse cx="50" cy="42" rx="28" ry="34" fill="#6fb7ff" />
    <path d="M46 76 L54 76 L50 82 Z" fill="#6fb7ff" />
    <path d="M36 28 Q34 36 36 42" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
  </g>
)

const CRITTERS = {
  pig: { Art: Pig, name: 'pig', plural: 'pigs' },
  cow: { Art: Cow, name: 'cow', plural: 'cows' },
  chick: { Art: Chick, name: 'chick', plural: 'chicks' },
  frog: { Art: Frog, name: 'frog', plural: 'frogs' },
  bunny: { Art: Bunny, name: 'bunny', plural: 'bunnies' },
  bear: { Art: Bear, name: 'bear', plural: 'bears' },
  cat: { Art: Cat, name: 'cat', plural: 'cats' },
  fish: { Art: Fish, name: 'fish', plural: 'fish' },
  ladybug: { Art: Ladybug, name: 'ladybug', plural: 'ladybugs' },
  apple: { Art: Apple, name: 'apple', plural: 'apples' },
  star: { Art: Star, name: 'star', plural: 'stars' },
  balloon: { Art: Balloon, name: 'balloon', plural: 'balloons' },
}


// Draws one critter inside an existing <svg> at (x, y) with the given size.
export function CritterG({ kind, x = 0, y = 0, size = 100, crossed = false }) {
  const { Art } = CRITTERS[kind] || CRITTERS.pig
  const s = size / 100
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Art />
      {crossed && (
        <path d="M10 10 L90 90 M90 10 L10 90" stroke="#d62828" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
      )}
    </g>
  )
}

export function Critter({ kind, size = 48, className, title, style }) {
  return (
    <svg viewBox="-4 -4 108 108" width={size} height={size} className={className} style={style} role="img" aria-label={title || CRITTERS[kind]?.name}>
      <CritterG kind={kind} />
    </svg>
  )
}
