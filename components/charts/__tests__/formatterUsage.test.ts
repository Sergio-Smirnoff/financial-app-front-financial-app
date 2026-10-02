import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'

const AXIS_SOURCES = ['AreaChart.tsx', 'BarPairChart.tsx', 'HorizonBars.tsx', 'primitives/Axis.tsx']

describe('chart axis formatting', () => {
  it.each(AXIS_SOURCES)('%s formats its axis with the shared compact formatter', (file) => {
    const source = readFileSync(path.resolve(__dirname, '..', file), 'utf8')
    expect(source).toMatch(/import \{[^}]*formatCompact(Money|Number)[^}]*\} from '@\/lib\/format'/)
    expect(source).not.toMatch(/toFixed\(0\)\}?k/)
    expect(source).not.toMatch(/=== 'USD' \? 'US\$'/)
  })
})
