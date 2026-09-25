import { CritterGroup, TenFrame, BaseTen, ArrayFig, EqualGroups } from './Counting.jsx'
import { Clock, Coins, Ruler, Angle } from './Measure.jsx'
import { FractionShape, NumberLine, DecimalGrid } from './Fractions.jsx'
import { Shape, Pattern, RectArea, Prism, CoordGrid } from './Geometry.jsx'
import { Pictograph, BarGraph } from './Graphs.jsx'
import { Critter } from '../art/Critters.jsx'

const FIGS = {
  critters: CritterGroup,
  critter: ({ kind, size }) => <Critter kind={kind} size={size || 60} />,
  tenFrame: TenFrame,
  baseTen: BaseTen,
  array: ArrayFig,
  groups: EqualGroups,
  clock: Clock,
  coins: Coins,
  ruler: Ruler,
  angle: Angle,
  fraction: FractionShape,
  numberLine: NumberLine,
  decimalGrid: DecimalGrid,
  shape: Shape,
  pattern: Pattern,
  rect: RectArea,
  prism: Prism,
  coord: CoordGrid,
  pictograph: Pictograph,
  bars: BarGraph,
}

export default function Figure({ fig: { type, ...props } }) {
  const C = FIGS[type]
  if (!C) return <span className="fig-missing">[{type}]</span>
  return <C {...props} />
}
