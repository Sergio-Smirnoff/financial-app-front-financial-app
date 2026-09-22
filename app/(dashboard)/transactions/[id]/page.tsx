import { notFound, redirect } from 'next/navigation'

export default async function TransactionByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound()
  }
  redirect(`/transactions?id=${numericId}`)
}
