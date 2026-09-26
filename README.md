# K5 Tutor

*Free math practice and printable worksheets, Kindergarten through Grade 5.*

Counting critters, skip counting, number bonds, addition and subtraction with regrouping, place value,
telling time, money, times tables, long division, fractions, decimals, area, volume, coordinates and more —
**98 topics, 339 levels**, loosely following the Common Core progression. Every topic starts easy and levels up.
A **Games** strand (K–1) builds the mental models behind board games: counting spaces on a race track with
ladders and slides, directions on a grid, tic-tac-toe, naming board squares, checkers jumps, chess piece moves
and mini sudoku.

- **Practice online** — one question at a time with a buddy (pig, cow, chick, frog…). Get 8 of 10 right to
  unlock the next level. Number pad for tablets, optional sounds.
- **Worksheets** — freshly generated every time, 1–5 pages, optional answer key, or an "easy → hard" sheet that
  ramps through every level. Print them, download a PDF, or fill them in online and check.
- **Free, no sign-up** — no accounts, no ads. Progress is kept in the browser's `localStorage` only.

Every worksheet has a seed in its URL (`#/worksheet/g2-add-2digit?level=2&seed=424242`), so a link always
reproduces the exact same sheet and answer key.

Everything runs client-side (React 19 + Vite + zustand) and deploys to GitHub Pages from `docs/`.

## Commands

```bash
npm run dev        # local dev server
npm run build      # build to docs/  (base /k5tutor/)
npm run preview    # preview the production build
npm run validate   # generate every topic × level many times and check each problem
npm run lint       # eslint
```

`docs/` and `dist/` are gitignored; the Actions workflow (`.github/workflows/deploy.yml`) validates, builds
and publishes on push to `main`. Pages source must be set to "GitHub Actions".

## How it works

| Path | What |
| --- | --- |
| `src/curriculum/games.js` | The Games topics (race track, grid walk, tic-tac-toe, board squares, checkers, chess, mini sudoku), included by the K and Grade 1 files. |
| `src/curriculum/grade{K,1..5}.js` | Topics. Each has `levels`, a print layout (`cols`, `perPage`) and `gen(rng, level)` returning a problem. |
| `src/curriculum/helpers.js` | The problem shape and builders: inline equations, column arithmetic, long division, number bonds, multiple choice. |
| `src/lib/answers.js` | Answer kinds (number, fraction, time, point, choice) and how typed input is checked — equivalent fractions, `1,250`, `.5`, `3:05` are all accepted. |
| `src/components/Problem.jsx` | Renders a problem as printable (empty boxes), answer key (red), or online (inputs). |
| `src/components/figures/` | SVG pictures: critter groups, ten frames, base-ten blocks, clocks, coins, rulers, fraction shapes, number lines, arrays, shapes, patterns, area/volume, coordinate grids, picture and bar graphs, digital clocks, dice, game boards (grid / chess / checkers), tic-tac-toe and sudoku grids. |
| `src/components/art/Critters.jsx` | The hand-drawn animals. |
| `src/lib/pdf.js` | PDF download: each letter-size page is snapshotted with `html-to-image` and placed with `jsPDF` (both lazy-loaded). |

### Adding a topic

Add an object to the grade file:

```js
{
  id: 'g3-my-topic',            // unique, used in URLs and saved progress
  strand: 'Multiplication',
  title: 'My Topic',
  blurb: 'One line for the topic card.',
  glyph: '×',                   // or art: 'pig'
  instructions: 'Printed at the top of the worksheet.',
  levels: ['Easy', 'Harder'],
  cols: 4,                      // number or (level) => number
  perPage: 24,
  gen(rng, level) {
    const a = rng.int(2, 9), b = rng.int(2, 9)
    return inline([a, '×', b, '=', B(0)], [num(a * b)])
  },
}
```

then run `npm run validate`.
