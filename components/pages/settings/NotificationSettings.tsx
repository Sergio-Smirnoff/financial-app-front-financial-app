'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useNotificationPreferences, useUpdatePreferences } from '@/lib/hooks/useNotifications'

export function NotificationSettings() {
  const { data, isLoading, error } = useNotificationPreferences()
  const updatePreferences = useUpdatePreferences()
  const [monthlyEmailEnabled, setMonthlyEmailEnabled] = useState(false)

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando...</div>
  }

  if (error || !data) {
    return <div className="text-muted-foreground">Error al cargar preferencias</div>
  }

  const handleToggle = async (enabled: boolean) => {
    setMonthlyEmailEnabled(enabled)
    await updatePreferences.mutateAsync({ monthlyEmailEnabled: enabled })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Configura cómo quieres recibir tus notificaciones.
      </p>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="monthly-email">Resumen mensual por email</Label>
          <p className="text-sm text-muted-foreground">
            Recibe un resumen de tus gastos del mes el primer día de cada mes.
          </p>
        </div>
        <Switch
          id="monthly-email"
          checked={data.monthlyEmailEnabled}
          onCheckedChange={handleToggle}
          disabled={updatePreferences.isPending}
        />
      </div>
    </div>
  )
}
