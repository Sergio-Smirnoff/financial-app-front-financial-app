'use client'

import { useQuery } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api/upload'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export function ImportsContent() {
  const { data: imports, isLoading } = useQuery({
    queryKey: ['upload-history'],
    queryFn: () => uploadApi.getHistory(),
  })

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading history...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Imported Count</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{format(new Date(item.createdAt), 'PPP p')}</TableCell>
                <TableCell>{item.fileType}</TableCell>
                <TableCell>{item.accountNumber}</TableCell>
                <TableCell>{item.importedCount}</TableCell>
                <TableCell>
                  <Badge variant={item.importStatus === 'COMPLETED' ? 'default' : 'destructive'}>
                    {item.importStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {(!imports || imports.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No imports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
