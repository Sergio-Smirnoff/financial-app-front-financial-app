'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export function DataSection() {
  return (
    <div id="data" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
      <h3 className="section-head">Datos y Exportación</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <span className="text-sm font-medium">Exportación de datos</span>
            <p className="text-xs text-muted-foreground">Descargar todo el historial de movimientos y cuentas en formato CSV.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Próximamente
            </span>
            <Button disabled size="sm">
              Exportar datos (CSV)
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-destructive">Eliminar cuenta</span>
            <p className="text-xs text-muted-foreground">Eliminar permanentemente tu usuario y todos los datos asociados.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Próximamente
            </span>
            <Button disabled variant="destructive" size="sm">
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
