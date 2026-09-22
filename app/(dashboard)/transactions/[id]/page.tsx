import { notFound, redirect } from 'next/navigation'

const TRANSACTION_ID = /^[1-9]\d{0,15}$/

export default async function TransactionByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!TRANSACTION_ID.test(id)) {
    notFound()
  }
  redirect(`/transactions?id=${id}`)
}
