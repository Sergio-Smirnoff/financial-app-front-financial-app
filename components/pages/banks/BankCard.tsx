"use client";

import { BankResponse } from "@/types/banks";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Trash2, Pencil, Bell, CreditCard, Landmark, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useLatestNotifications } from "@/lib/hooks/useNotifications";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/shared/Surface";

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
    <Surface 
      onClick={handleCardClick}
      className="group relative overflow-hidden transition-all cursor-pointer h-full flex flex-col hover:border-primary/50"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/30 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background border transition-transform group-hover:scale-105">
            {bank.logoUrl ? (
              <img src={bank.logoUrl} alt={bank.name} className="h-8 w-8 object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-xl font-bold">{bank.name}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors mr-1 ${hasAlerts ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground'}`}>
            <Bell className={`h-4 w-4 ${hasAlerts ? 'animate-bounce' : ''}`} />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-muted" 
            onClick={(e) => { e.stopPropagation(); onEdit(bank); }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" 
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
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Balance</p>
            <div className="flex flex-col">
              {Object.entries(bank.totalBalances || {}).length > 0 ? (
                Object.entries(bank.totalBalances).map(([currency, amount]) => (
                  <p key={currency} className="text-lg font-bold tracking-tight text-muted-foreground/50">
                    {formatCurrency(amount, currency)}
                  </p>
                ))
              ) : (
                <p className="text-lg font-bold text-muted-foreground/50">0.00 USD</p>
              )}
            </div>
          </div>

          {/* Asset Counts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-muted/20 border">
              <Wallet className="h-4 w-4 text-muted-foreground mb-1.5" />
              <span className="text-sm font-bold">{bank.accountsCount}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Accounts</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-muted/20 border">
              <CreditCard className="h-4 w-4 text-muted-foreground mb-1.5" />
              <span className="text-sm font-bold">{bank.cardsCount}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Cards</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-muted/20 border">
              <Landmark className="h-4 w-4 text-muted-foreground mb-1.5" />
              <span className="text-sm font-bold">{bank.loansCount}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Loans</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Surface>
  );
}
