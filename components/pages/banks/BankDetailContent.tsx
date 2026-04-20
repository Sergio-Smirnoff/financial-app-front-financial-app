"use client";

import { useState, useMemo } from "react";
import { useBank, useAccounts } from "@/lib/hooks/useBanks";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, ArrowLeftRight, Landmark, Wallet, PlusCircle, MinusCircle, History, Bell, Trash2 } from "lucide-react";
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
import { TransactionHistoryDialog } from "./TransactionHistoryDialog";
import { BankNotificationDialog } from "./BankNotificationDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useLatestNotifications } from "@/lib/hooks/useNotifications";
import { useUiStore } from "@/lib/store/ui.store";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface Props { bankId: number }

export function BankDetailContent({ bankId }: Props) {
  const queryClient = useQueryClient();
  const { data: bank, isLoading, isError } = useBank(bankId);
  const { createAccount, updateAccount, deleteAccount } = useAccounts();
  const { openConfirmDelete } = useUiStore();
  const { data: notifications } = useLatestNotifications();
  
  const [accDialogOpen, setAccDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);
  
  const [transferOpen, setTransferOpen] = useState(false);
  const [quickTxOpen, setQuickTxOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bankNotifOpen, setBankNotifOpen] = useState(false);
  
  const [quickTxType, setQuickTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);
  const [activeAccountName, setActiveAccountName] = useState<string>('');
  const [activeCurrency, setActiveCurrency] = useState<string>('USD');

  const hasAlerts = useMemo(() => {
    if (!notifications) return false;
    return notifications.some(n => {
      try {
        const metadata = n.metadata ? JSON.parse(n.metadata) : {};
        return metadata.bankId === bankId && !n.read;
      } catch (e) {
        return false;
      }
    });
  }, [notifications, bankId]);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !bank) return <ErrorMessage message="Bank not found" />;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['banks', bankId] });
    if (activeAccountId) {
        queryClient.invalidateQueries({ queryKey: ['transactions', 'account', activeAccountId] });
    }
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
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

  const openHistory = (account: AccountResponse) => {
    setActiveAccountId(account.id);
    setActiveAccountName(account.name);
    setActiveCurrency(account.currency);
    setHistoryOpen(true);
  };

  const handleDeleteAccount = (account: AccountResponse) => {
    openConfirmDelete({
      title: 'Delete account',
      description: `Delete "${account.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteAccount(account.id);
          handleRefresh();
        } catch (e) {
          // Error handled by mutation toast
        }
      },
    });
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{bank.name}</h1>
                <button 
                    onClick={() => setBankNotifOpen(true)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 ${hasAlerts ? 'bg-red-50 text-red-500' : 'text-zinc-400'}`}
                >
                    <Bell className={`h-4 w-4 ${hasAlerts ? 'animate-bounce' : ''}`} />
                </button>
              </div>
              <p className="text-sm text-zinc-500">Manage accounts, cards and loans</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-12">
        {/* Accounts Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 px-1">Accounts</h2>
          <div className="grid grid-cols-1 gap-4">
            {bank.accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-3xl bg-zinc-50/50">
                <Wallet className="h-10 w-10 text-zinc-300 mb-3" />
                <p className="text-base font-medium text-zinc-900">No accounts yet</p>
                <Button onClick={handleAddAccount} variant="outline" size="sm" className="mt-4">Create account</Button>
              </div>
            ) : (
              <>
                {bank.accounts.map((account) => (
                  <div key={account.id} className="bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400" title="History" onClick={() => openHistory(account)}>
                              <History className="h-4 w-4" />
                          </Button>
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-zinc-400 hover:text-red-600" 
                              title="Delete Account" 
                              onClick={() => handleDeleteAccount(account)}
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                    variant="ghost" 
                    className="w-full h-12 border-2 border-dashed rounded-3xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 gap-2 font-semibold"
                    onClick={handleAddAccount}
                >
                    <Plus className="h-4 w-4" /> Add another account
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Cards and Loans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border rounded-3xl shadow-sm overflow-hidden">
            <CardList bankId={bankId} />
          </section>
          <section className="bg-zinc-50/10 border rounded-3xl shadow-sm overflow-hidden">
            <LoanList bankId={bankId} />
          </section>
        </div>
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
          handleRefresh();
        }}
      />

      <TransferDialog 
        open={transferOpen} 
        onOpenChange={setTransferOpen} 
        onSuccess={handleRefresh} 
        defaultFromAccountId={activeAccountId}
      />

      <QuickTransactionDialog 
        open={quickTxOpen}
        onOpenChange={setQuickTxOpen}
        onSuccess={handleRefresh}
        accountId={activeAccountId ?? 0}
        currency={activeCurrency}
        type={quickTxType}
      />

      <TransactionHistoryDialog 
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        accountId={activeAccountId ?? 0}
        accountName={activeAccountName}
        currency={activeCurrency}
      />

      <BankNotificationDialog
        open={bankNotifOpen}
        onOpenChange={setBankNotifOpen}
        bankId={bankId}
        bankName={bank.name}
      />

      <ConfirmDialog />
    </div>
  );
}
