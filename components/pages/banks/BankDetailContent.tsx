"use client";

import { useState } from "react";
import { useBank, useAccounts } from "@/lib/hooks/useBanks";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, ArrowLeftRight, Landmark, Wallet, PlusCircle, MinusCircle, History } from "lucide-react";
import { AccountResponse } from "@/types/banks";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { CardList } from "./CardList";
import { LoanList } from "./LoanList";
import { AccountFormDialog } from "./AccountFormDialog";
import { TransferDialog } from "../transactions/TransferDialog";
import { QuickTransactionDialog } from "./QuickTransactionDialog";

interface Props { bankId: number }

export function BankDetailContent({ bankId }: Props) {
  const { data: bank, isLoading, isError } = useBank(bankId);
  const { createAccount, updateAccount } = useAccounts();
  
  const [accDialogOpen, setAccDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);
  
  const [transferOpen, setTransferOpen] = useState(false);
  const [quickTxOpen, setQuickTxOpen] = useState(false);
  const [quickTxType, setQuickTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);
  const [activeCurrency, setActiveCurrency] = useState<string>('USD');

  if (isLoading) return <LoadingSpinner />;
  if (isError || !bank) return <ErrorMessage message="Bank not found" />;

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setAccDialogOpen(true);
  };

  const handleEditAccount = (account: AccountResponse) => {
    setSelectedAccount(account);
    setAccDialogOpen(true);
  };

  const openTransfer = (accountId: number) => {
    setActiveAccountId(accountId);
    setTransferOpen(true);
  };

  const openQuickTx = (accountId: number, currency: string, type: 'INCOME' | 'EXPENSE') => {
    setActiveAccountId(accountId);
    setActiveCurrency(currency);
    setQuickTxType(type);
    setQuickTxOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-8 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/banks">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border shadow-sm">
                {bank.logoUrl ? (
                <img src={bank.logoUrl} alt={bank.name} className="h-8 w-8 object-contain" />
                ) : (
                <Landmark className="h-6 w-6 text-zinc-400" />
                )}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{bank.name}</h1>
              <p className="text-sm text-zinc-500">Manage accounts, cards and loans</p>
            </div>
          </div>
        </div>
        
        <Button onClick={handleAddAccount} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Account</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 pb-12">
        {bank.accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-zinc-50/50">
            <Wallet className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-lg font-medium text-zinc-900">No accounts yet</p>
            <p className="text-sm text-zinc-500 mb-6">Create your first account in this bank to start tracking transactions.</p>
            <Button onClick={handleAddAccount} variant="outline">Create account</Button>
          </div>
        ) : (
          bank.accounts.map((account) => (
            <div key={account.id} className="bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-zinc-50/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center shadow-sm">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-zinc-900">{account.name}</h3>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 h-5">
                            {account.type}
                        </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">{account.currency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-tighter">Available Balance</p>
                    <p className="text-2xl font-black text-zinc-900">
                        {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold" onClick={() => openTransfer(account.id)}>
                        <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700" onClick={() => openQuickTx(account.id, account.currency, 'INCOME')}>
                        <PlusCircle className="h-3.5 w-3.5" /> Deposit
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700" onClick={() => openQuickTx(account.id, account.currency, 'EXPENSE')}>
                        <MinusCircle className="h-3.5 w-3.5" /> Withdraw
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400" title="History">
                        <History className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-zinc-100">
                <div className="p-0">
                    <CardList accountId={account.id} />
                </div>
                <div className="p-0 bg-zinc-50/10">
                    <LoanList accountId={account.id} />
                </div>
              </div>
            </div>
          ))
        )}

        {bank.accounts.length > 0 && (
            <Button 
                variant="ghost" 
                className="w-full h-16 border-2 border-dashed rounded-3xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 gap-2 font-semibold"
                onClick={handleAddAccount}
            >
                <Plus className="h-5 w-5" /> Add another account
            </Button>
        )}
      </div>

      <AccountFormDialog 
        open={accDialogOpen} 
        onOpenChange={setAccDialogOpen} 
        bankId={bankId}
        account={selectedAccount}
        onSubmit={async (data) => {
          if (selectedAccount) {
            await updateAccount({ id: selectedAccount.id, data });
          } else {
            await createAccount(data);
          }
        }}
      />

      <TransferDialog 
        open={transferOpen} 
        onOpenChange={setTransferOpen} 
        onSuccess={() => {}} 
        defaultFromAccountId={activeAccountId}
      />

      <QuickTransactionDialog 
        open={quickTxOpen}
        onOpenChange={setQuickTxOpen}
        onSuccess={() => {}}
        accountId={activeAccountId ?? 0}
        currency={activeCurrency}
        type={quickTxType}
      />
    </div>
  );
}
