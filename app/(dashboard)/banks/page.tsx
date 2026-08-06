import { BanksContent } from '@/components/pages/banks/BanksContent'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Banks | Financial App',
  description: 'Manage your banks and accounts',
}

export default function BanksPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <BanksContent />
    </main>
  )
}
