import React, { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useElementSize } from './useElementSize'

export interface ChartSize {
  width: number
  height: number
}

export interface ChartFrameProps {
  ariaLabel: string
  dataTable?: Array<{ label: string; value: string | number }>
  className?: string
  minHeight?: number
  children: (size: ChartSize) => ReactNode
}

export function ChartFrame({ ariaLabel, dataTable, className, minHeight = 160, children }: ChartFrameProps) {
  const t = useTranslations('common.chart')
  const [ref, measured] = useElementSize<HTMLDivElement>()
  const size: ChartSize = { width: measured.width, height: Math.max(measured.height, minHeight) }
  const ready = size.width > 0

  return (
    <div ref={ref} data-chart-frame className={cn('relative h-full w-full', className)} style={{ minHeight }}>
      <svg
        role="img"
        aria-label={ariaLabel}
        width={size.width}
        height={size.height}
        viewBox={ready ? `0 0 ${size.width} ${size.height}` : undefined}
        className="absolute left-0 top-0 overflow-visible select-none"
      >
        {ready && children(size)}
      </svg>
      {dataTable && dataTable.length > 0 && (
        <div className="sr-only">
          <table>
            <caption>{ariaLabel}</caption>
            <thead>
              <tr>
                <th scope="col">{t('label')}</th>
                <th scope="col">{t('value')}</th>
              </tr>
            </thead>
            <tbody>
              {dataTable.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.label}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
