'use client'

import { NotificationSettings } from '@/components/pages/settings/NotificationSettings'

export default function SettingsPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <div className="space-y-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Notificaciones</h2>
          <NotificationSettings />
        </section>
      </div>
    </div>
  )
}
