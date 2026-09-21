import { redirect } from 'next/navigation'

export default async function TransactionByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/transactions?id=${encodeURIComponent(id)}`)
}
