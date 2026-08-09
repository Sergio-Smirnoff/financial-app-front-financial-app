import { cn } from '@/lib/utils'

export interface DetailItem {
  term: string
  detail: React.ReactNode
}

export interface DetailListProps {
  items: DetailItem[]
  className?: string
}

export function DetailList({ items, className }: DetailListProps) {
  return (
    <dl className={cn('grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm', className)}>
      {items.map((item) => (
        <div key={item.term} className="contents">
          <dt className="text-muted-foreground whitespace-nowrap">{item.term}</dt>
          <dd className="font-medium">{item.detail}</dd>
        </div>
      ))}
    </dl>
  )
}
