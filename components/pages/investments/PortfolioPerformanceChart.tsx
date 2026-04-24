'use client'

import { useState } from 'react'
import { usePortfolioEvolution } from '@/lib/hooks/useInvestments'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { Surface } from '@/components/shared/Surface'
import { Button } from '@/components/ui/button'

export function PortfolioPerformanceChart() {
  const { data: evolution, isLoading } = usePortfolioEvolution(30)
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS')

  if (isLoading || !evolution || evolution.length === 0) {
      return (
          <Surface className="h-[300px] flex items-center justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                  {isLoading ? 'Loading Performance...' : 'No historical data yet'}
              </p>
          </Surface>
      )
  }

  return (
    <Surface>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Portfolio Evolution
        </CardTitle>
        <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border/50">
            <Button 
                variant="ghost" 
                size="sm" 
                className={`h-6 px-2 text-[9px] font-black rounded-md transition-all ${currency === 'ARS' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                onClick={() => setCurrency('ARS')}
            >
                ARS
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className={`h-6 px-2 text-[9px] font-black rounded-md transition-all ${currency === 'USD' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                onClick={() => setCurrency('USD')}
            >
                USD
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolution} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                fontSize={9}
                fontWeight="bold"
                axisLine={false}
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                fontSize={9}
                fontWeight="bold"
                axisLine={false}
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                }}
                itemStyle={{ fontWeight: 'black' }}
                formatter={(value: any) => [formatCurrency(Number(value ?? 0), currency), currency === 'ARS' ? 'Value (ARS)' : 'Value (USD)']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Line 
                type="monotone" 
                dataKey={currency === 'ARS' ? 'totalValueArs' : 'totalValueUsd'} 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ r: 2, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                activeDot={{ r: 4, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Surface>
  )
}
