// Run with `npm test` (needs Node 22.18+ for built-in TypeScript support).
import { csvCell } from './csv.ts'

const cases: Array<[string, string]> = [
  // formula triggers get an apostrophe
  ['=1+1', "'=1+1"],
  ['@SUM(A1)', "'@SUM(A1)"],
  ['+cmd', "'+cmd"],
  ['-2+3', "'-2+3"],
  ['\n=HYPERLINK("x")', '"\'\n=HYPERLINK(""x"")"'],
  ['   =1+1', "'   =1+1"],
  ['\tx', "'\tx"],
  ['＝1+1', "'＝1+1"],
  ['＠SUM(A1)', "'＠SUM(A1)"],
  // plain values are untouched
  ['-5', '-5'],
  ['-5.25', '-5.25'],
  ['42', '42'],
  ['a-b', 'a-b'],
  ['hello, world', '"hello, world"'],
  ['say "hi"', '"say ""hi"""'],
]

let failed = 0
for (const [input, expected] of cases) {
  const got = csvCell(input)
  if (got !== expected) {
    failed++
    console.error(`FAIL csvCell(${JSON.stringify(input)}) = ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`)
  }
}
if (failed) {
  throw new Error(`${failed} of ${cases.length} csvCell cases failed`)
}
console.log(`csvCell: ${cases.length} cases passed`)
