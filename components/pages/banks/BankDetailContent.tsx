"use client";

import { useState, useMemo } from "react";
import { useBank, useAccounts } from "@/lib/hooks/useBanks";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, ArrowLeftRight, Landmark, Wallet, PlusCircle, MinusCircle, History, Bell, Trash2, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [hideEmptyAccounts, setHideEmptyAccounts] = useState(false);

  const filteredAccounts = useMemo(() => {
    if (!bank?.accounts) return [];
    return bank.accounts.filter((account) => {
      const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCurrency = filterCurrency === 'ALL' || account.currency === filterCurrency;
      const matchesType = filterType === 'ALL' || account.type === filterType;
      const matchesEmpty = !hideEmptyAccounts || account.balance !== 0;
      return matchesSearch && matchesCurrency && matchesType && matchesEmpty;
    });
  }, [bank?.accounts, searchQuery, filterCurrency, filterType, hideEmptyAccounts]);

  const uniqueCurrencies = useMemo(() => {
    if (!bank?.accounts) return [];
    return Array.from(new Set(bank.accounts.map(a => a.currency))).sort();
  }, [bank?.accounts]);

  const uniqueTypes = useMemo(() => {
    if (!bank?.accounts) return [];
    return Array.from(new Set(bank.accounts.map(a => a.type))).sort();
  }, [bank?.accounts]);

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
    <div className="space-y-6 animate-in fade-in duration-500 p-8 flex flex-col h-full overflow-hidden w-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/banks">
            <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shadow-none">
                {bank.logoUrl ? (
                <img src={bank.logoUrl} alt={bank.name} className="h-8 w-8 object-contain" />
                ) : (
                <Landmark className="h-6 w-6 text-zinc-600" />
                )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">{bank.name}</h1>
                <button 
                    onClick={() => setBankNotifOpen(true)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-zinc-800 ${hasAlerts ? 'bg-red-500/10 text-red-500' : 'text-zinc-600'}`}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Accounts</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <Input 
                  placeholder="Search accounts..." 
                  className="pl-9 h-9 rounded-xl border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                <SelectTrigger className="w-[100px] h-9 rounded-xl border-zinc-800 bg-zinc-900/50 text-xs font-bold text-zinc-400">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="ALL">All</SelectItem>
                  {uniqueCurrencies.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[120px] h-9 rounded-xl border-zinc-800 bg-zinc-900/50 text-xs font-bold text-zinc-400">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="ALL">All Types</SelectItem>
                  {uniqueTypes.map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-3 h-9 rounded-xl">
                <Switch 
                  id="hide-empty" 
                  checked={hideEmptyAccounts}
                  onCheckedChange={setHideEmptyAccounts}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="hide-empty" className="text-[9px] font-bold uppercase text-zinc-500 cursor-pointer">Hide Empty</Label>
              </div>

              {(searchQuery || filterCurrency !== 'ALL' || filterType !== 'ALL' || hideEmptyAccounts) && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl text-zinc-600 hover:text-white hover:bg-zinc-800"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCurrency('ALL');
                    setFilterType('ALL');
                    setHideEmptyAccounts(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <Wallet className="h-10 w-10 text-zinc-800 mb-3" />
                <p className="text-base font-medium text-zinc-500">
                  {bank.accounts.length === 0 ? "No accounts yet" : "No accounts match your filters"}
                </p>
                {bank.accounts.length === 0 ? (
                  <Button onClick={handleAddAccount} variant="outline" size="sm" className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800">Create account</Button>
                ) : (
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCurrency('ALL');
                      setFilterType('ALL');
                      setHideEmptyAccounts(false);
                    }} 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 text-zinc-600 hover:text-white"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                {filteredAccounts.map((account) => (
                  <div key={account.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-none transition-all group">
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-white">{account.name}</h3>
                              <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 h-5 bg-zinc-800 text-zinc-400 border-none">
                                  {account.type}
                              </Badge>
                          </div>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Available Balance</p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <div className="md:text-right">
                          <p className="text-2xl font-black text-white tracking-tight">
                              {formatCurrency(account.balance, account.currency)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 border-t border-zinc-800 md:border-t-0 pt-3 md:pt-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 gap-1.5 text-xs font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-800" 
                            onClick={() => openTransfer(account.id)}
                            disabled={account.type === 'INVESTMENT'}
                          >
                              <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 gap-1.5 text-xs font-bold uppercase text-green-500 hover:text-green-400 hover:bg-green-500/10" 
                            onClick={() => openQuickTx(account.id, account.currency, 'INCOME')}
                            disabled={account.type === 'INVESTMENT'}
                          >
                              <PlusCircle className="h-3.5 w-3.5" /> Deposit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 gap-1.5 text-xs font-bold uppercase text-red-500 hover:text-red-400 hover:bg-red-500/10" 
                            onClick={() => openQuickTx(account.id, account.currency, 'EXPENSE')}
                            disabled={account.type === 'INVESTMENT'}
                          >
                              <MinusCircle className="h-3.5 w-3.5" /> Withdraw
                          </Button>
                          <div className="w-px h-4 bg-zinc-800 mx-1 hidden md:block" />
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-600 hover:text-white" title="History" onClick={() => openHistory(account)}>
                              <History className="h-4 w-4" />
                          </Button>
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-zinc-600 hover:text-red-500 hover:bg-red-500/10" 
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
                    className="w-full h-14 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50 gap-2 font-bold uppercase text-xs"
                    onClick={handleAddAccount}
                >
                    <Plus className="h-4 w-4" /> Add another account
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Cards and Loans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 items-stretch">
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-none overflow-hidden flex flex-col">
            <CardList bankId={bankId} />
          </section>
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-none overflow-hidden flex flex-col">
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
