import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'

const ROOT = path.resolve(__dirname, '..', '..', '..')
const AXIS_SOURCES = ['AreaChart.tsx', 'BarPairChart.tsx', 'HorizonBars.tsx', 'primitives/Axis.tsx']
const HAND_ROLLED_THOUSANDS = /\/ ?1_?000\)?\.toFixed/

function sourcesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) return sourcesUnder(full)
    return /\.tsx?$/.test(entry) ? [full] : []
  })
}

describe('chart axis formatting', () => {
  it.each(AXIS_SOURCES)('%s formats its axis with the shared compact formatter', (file) => {
    const source = readFileSync(path.resolve(__dirname, '..', file), 'utf8')
    expect(source).toMatch(/import \{[^}]*formatCompact(Money|Number)[^}]*\} from '@\/lib\/format'/)
    expect(source).not.toMatch(/toFixed\(0\)\}?k/)
    expect(source).not.toMatch(/=== 'USD' \? 'US\$'/)
  })

  it('leaves no hand-rolled thousands formatting in components or lib', () => {
    const offenders = ['components', 'lib']
      .flatMap((dir) => sourcesUnder(path.join(ROOT, dir)))
      .filter((file) => HAND_ROLLED_THOUSANDS.test(readFileSync(file, 'utf8')))
    expect(offenders).toEqual([])
  })
})
