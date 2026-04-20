"use client";

import { BankResponse } from "@/types/banks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Trash2, Pencil, Bell, CreditCard, Landmark, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useLatestNotifications } from "@/lib/hooks/useNotifications";
import { useMemo } from "react";

interface BankCardProps {
  bank: BankResponse;
  onEdit: (bank: BankResponse) => void;
  onDelete: (id: number) => void;
}

export function BankCard({ 
  bank, 
  onEdit, 
  onDelete
}: BankCardProps) {
  const { data: notifications } = useLatestNotifications();

  const hasAlerts = useMemo(() => {
    if (!notifications) return false;
    return notifications.some(n => {
      try {
        const metadata = n.metadata ? JSON.parse(n.metadata) : {};
        return metadata.bankId === bank.id && !n.read;
      } catch (e) {
        return false;
      }
    });
  }, [notifications, bank.id]);

  return (
    <Card className="group relative overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md cursor-pointer h-full flex flex-col">
      <Link href={`/banks/${bank.id}`} className="absolute inset-0 z-0" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-zinc-50/50 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border shadow-sm group-hover:scale-105 transition-transform">
            {bank.logoUrl ? (
              <img src={bank.logoUrl} alt={bank.name} className="h-8 w-8 object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-zinc-400" />
            )}
          </div>
          <CardTitle className="text-xl font-bold">{bank.name}</CardTitle>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" onClick={(e) => { e.preventDefault(); onEdit(bank); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-600" onClick={(e) => { e.preventDefault(); onDelete(bank.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col justify-between relative z-10">
        <div className="space-y-4">
          {/* Summary Totals */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Balance</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(bank.totalBalances || {}).length > 0 ? (
                Object.entries(bank.totalBalances).map(([currency, amount]) => (
                  <p key={currency} className="text-lg font-bold text-zinc-900">
                    {formatCurrency(amount, currency)}
                  </p>
                ))
              ) : (
                <p className="text-lg font-bold text-zinc-400">$ 0.00</p>
              )}
            </div>
          </div>

          {/* Asset Counts */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-100">
            <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-zinc-50/50">
              <Wallet className="h-4 w-4 text-zinc-400 mb-1" />
              <span className="text-xs font-bold">{bank.accountsCount}</span>
              <span className="text-[10px] text-zinc-500 uppercase">Accounts</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-zinc-50/50">
              <CreditCard className="h-4 w-4 text-zinc-400 mb-1" />
              <span className="text-xs font-bold">{bank.cardsCount}</span>
              <span className="text-[10px] text-zinc-500 uppercase">Cards</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-zinc-50/50">
              <Landmark className="h-4 w-4 text-zinc-400 mb-1" />
              <span className="text-xs font-bold">{bank.loansCount}</span>
              <span className="text-[10px] text-zinc-500 uppercase">Loans</span>
            </div>
          </div>
        </div>

        {/* Footer info & Notification Bell */}
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal text-zinc-500">
            {bank.accountsCount === 1 ? '1 account' : `${bank.accountsCount} accounts`}
          </Badge>
          
          <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${hasAlerts ? 'bg-red-50 text-red-500' : 'text-zinc-300'}`}>
            <Bell className={`h-4 w-4 ${hasAlerts ? 'animate-bounce' : ''}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
