"use client";

import { BankResponse } from "@/types/banks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Trash2, Pencil, Bell, CreditCard, Landmark, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { useLatestNotifications } from "@/lib/hooks/useNotifications";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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

  const handleCardClick = () => {
    router.push(`/banks/${bank.id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      className="group relative overflow-hidden border-zinc-800 bg-zinc-900 shadow-none transition-all cursor-pointer h-full flex flex-col hover:border-zinc-700"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-zinc-800/50 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 transition-transform group-hover:scale-105">
            {bank.logoUrl ? (
              <img src={bank.logoUrl} alt={bank.name} className="h-8 w-8 object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-zinc-600" />
            )}
          </div>
          <CardTitle className="text-xl font-bold text-white">{bank.name}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors mr-1 ${hasAlerts ? 'bg-red-500/10 text-red-500' : 'text-zinc-600'}`}>
            <Bell className={`h-4 w-4 ${hasAlerts ? 'animate-bounce' : ''}`} />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800" 
            onClick={(e) => { e.stopPropagation(); onEdit(bank); }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10" 
            onClick={(e) => { e.stopPropagation(); onDelete(bank.id); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Summary Totals */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Balance</p>
            <div className="flex flex-col">
              {Object.entries(bank.totalBalances || {}).length > 0 ? (
                Object.entries(bank.totalBalances).map(([currency, amount]) => (
                  <p key={currency} className="text-lg font-bold text-zinc-500 tracking-tight">
                    {formatCurrency(amount, currency)}
                  </p>
                ))
              ) : (
                <p className="text-lg font-bold text-zinc-700">0.00 USD</p>
              )}
            </div>
          </div>

          {/* Asset Counts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800/50">
              <Wallet className="h-4 w-4 text-zinc-500 mb-1.5" />
              <span className="text-sm font-bold text-white">{bank.accountsCount}</span>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Accounts</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800/50">
              <CreditCard className="h-4 w-4 text-zinc-500 mb-1.5" />
              <span className="text-sm font-bold text-white">{bank.cardsCount}</span>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Cards</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800/50">
              <Landmark className="h-4 w-4 text-zinc-500 mb-1.5" />
              <span className="text-sm font-bold text-white">{bank.loansCount}</span>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Loans</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
