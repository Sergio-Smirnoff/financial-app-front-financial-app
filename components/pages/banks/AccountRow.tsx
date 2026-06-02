"use client";

import { AccountResponse } from "@/types/banks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/shared/Surface";
import { formatCurrency } from "@/lib/utils/currency";
import { ArrowLeftRight, PlusCircle, MinusCircle, History, Trash2, Wallet } from "lucide-react";

interface Props {
  account: AccountResponse;
  bankName?: string;
  holdingsValue?: number;
  onDeposit: (account: AccountResponse) => void;
  onWithdraw: (account: AccountResponse) => void;
  onTransfer: (account: AccountResponse) => void;
  onHistory: (account: AccountResponse) => void;
  onDelete: (account: AccountResponse) => void;
}

export function AccountRow({ account, bankName, holdingsValue, onDeposit, onWithdraw, onTransfer, onHistory, onDelete }: Props) {
  const isInvestment = account.type === "INVESTMENT";
  const maskedCbu = `••••${account.cbu.slice(-4)}`;
  // Investment accounts show the market value of their holdings instead of a cash balance.
  const displayValue = isInvestment && holdingsValue !== undefined ? holdingsValue : Number(account.balance);

  return (
    <Surface className="rounded-2xl transition-all group">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center border">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{account.name}</h3>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 h-5 bg-muted text-muted-foreground border-none">
                {account.type}
              </Badge>
              {account.alias && (
                <span className="text-xs text-muted-foreground">{account.alias}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {bankName ? `${bankName} · ` : ""}{maskedCbu}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="md:text-right">
            <p className="text-2xl font-black tracking-tight text-muted-foreground">
              {formatCurrency(displayValue, account.currency)}
            </p>
            {isInvestment && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Holdings value</p>
            )}
          </div>

          <div className="flex items-center gap-1 border-t md:border-t-0 pt-3 md:pt-0">
            {!isInvestment && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 text-xs font-bold uppercase text-green-500 hover:text-green-400 hover:bg-green-500/10"
                  onClick={() => onDeposit(account)}
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Deposit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 text-xs font-bold uppercase text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => onWithdraw(account)}
                >
                  <MinusCircle className="h-3.5 w-3.5" /> Withdraw
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 text-xs font-bold uppercase text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => onTransfer(account)}
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                </Button>
                <div className="w-px h-4 bg-border mx-1 hidden md:block" />
              </>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" title="History" onClick={() => onHistory(account)}>
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete Account"
              onClick={() => onDelete(account)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Surface>
  );
}
