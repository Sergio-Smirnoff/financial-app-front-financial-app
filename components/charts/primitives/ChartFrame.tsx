import React, { ReactNode } from 'react'

export interface ChartFrameProps {
  width?: number
  height?: number
  ariaLabel: string
  dataTable?: Array<{ label: string; value: string | number }>
  children: ReactNode
  className?: string
}

export function ChartFrame({
  width = 640,
  height = 240,
  ariaLabel,
  dataTable,
  children,
  className = ''
}: ChartFrameProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto overflow-visible select-none"
      >
        {children}
      </svg>
      {dataTable && dataTable.length > 0 && (
        <table className="sr-only">
          <caption>{ariaLabel}</caption>
          <thead>
            <tr>
              <th scope="col">Etiqueta / Fecha</th>
              <th scope="col">Valor</th>
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
      )}
    </div>
  )
}
