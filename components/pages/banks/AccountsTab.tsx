"use client";

import { useMemo, useState } from "react";
import { useBanks, useAccounts } from "@/lib/hooks/useBanks";
import { useUiStore } from "@/lib/store/ui.store";
import { AccountResponse, AccountRequest, UpdateAccountRequest, BankResponse } from "@/types/banks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Surface } from "@/components/shared/Surface";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/utils/currency";
import { Plus, Search, X, Landmark, Wallet } from "lucide-react";
import { AccountRow } from "./AccountRow";
import { AddAccountDialog } from "./AddAccountDialog";
import { RecordTransactionDialog, RecordMode } from "./RecordTransactionDialog";
import { TransactionHistoryDialog } from "./TransactionHistoryDialog";

export function AccountsTab() {
  const { banks, isLoading, isError } = useBanks();
  const { createAccount, updateAccount, deleteAccount } = useAccounts();
  const { openConfirmDelete } = useUiStore();

  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountResponse | null>(null);

  const [recordOpen, setRecordOpen] = useState(false);
  const [recordMode, setRecordMode] = useState<RecordMode>("DEPOSIT");
  const [recordAccount, setRecordAccount] = useState<AccountResponse | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAccount, setHistoryAccount] = useState<AccountResponse | null>(null);

  const [search, setSearch] = useState("");
  const [filterBank, setFilterBank] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const totals = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const b of banks) for (const [ccy, amt] of Object.entries(b.totalBalances ?? {})) acc[ccy] = (acc[ccy] ?? 0) + Number(amt);
    return acc;
  }, [banks]);

  const matches = (a: AccountResponse) =>
    a.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterType === "ALL" || a.type === filterType);

  const visibleBanks = useMemo(
    () => banks.filter((b) => filterBank === "ALL" || b.bankNumber === filterBank),
    [banks, filterBank],
  );

  const hasFilters = search !== "" || filterBank !== "ALL" || filterType !== "ALL";
  const clearFilters = () => { setSearch(""); setFilterBank("ALL"); setFilterType("ALL"); };

  const openRecord = (account: AccountResponse, mode: RecordMode) => {
    setRecordAccount(account);
    setRecordMode(mode);
    setRecordOpen(true);
  };

  const openHistory = (account: AccountResponse) => {
    setHistoryAccount(account);
    setHistoryOpen(true);
  };

  const handleDelete = (account: AccountResponse) => {
    openConfirmDelete({
      title: "Delete account",
      description: `Delete "${account.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try { await deleteAccount(account.cbu); } catch { /* toast handled */ }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Totals header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {Object.keys(totals).length === 0 ? (
            <p className="text-muted-foreground">No balances yet</p>
          ) : (
            Object.entries(totals).map(([ccy, amt]) => (
              <div key={ccy}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total {ccy}</p>
                <p className="text-2xl font-black tracking-tight">{formatCurrency(amt, ccy)}</p>
              </div>
            ))
          )}
        </div>
        <Button onClick={() => { setEditAccount(null); setAddOpen(true); }} className="h-11 px-6 gap-2 rounded-xl font-bold">
          <Plus className="h-5 w-5" /> Add Account
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            className="pl-9 h-9 rounded-xl border-border bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterBank} onValueChange={setFilterBank}>
          <SelectTrigger className="w-[180px] h-9 rounded-xl border-border bg-background text-xs font-bold text-muted-foreground">
            <SelectValue placeholder="Bank" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All Banks</SelectItem>
            {banks.map((b) => <SelectItem key={b.bankNumber} value={b.bankNumber}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px] h-9 rounded-xl border-border bg-background text-xs font-bold text-muted-foreground">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CHECKING">Checking</SelectItem>
            <SelectItem value="SAVINGS">Savings</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={!!isError}
        loadingComponent={
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 w-full rounded-2xl animate-pulse bg-muted/50 border" />)}
          </div>
        }
      >
        {banks.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-muted/20 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted border mb-6">
              <Wallet className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No accounts yet</h2>
            <p className="max-w-[340px] text-muted-foreground mb-8">Add your first account from the bank catalog to start tracking balances.</p>
            <Button onClick={() => { setEditAccount(null); setAddOpen(true); }} size="lg" className="gap-2 rounded-xl font-bold">
              <Plus className="h-5 w-5" /> Add Account
            </Button>
          </div>
        ) : (
          <div className="space-y-8 pb-12">
            {visibleBanks.map((bank: BankResponse) => {
              const accounts = bank.accounts.filter(matches);
              if (accounts.length === 0) return null;
              return (
                <section key={bank.bankNumber} className="space-y-3">
                  <div className="flex items-center gap-3 px-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background border">
                      {bank.logoUrl ? (
                        <img src={bank.logoUrl} alt={bank.name} className="h-5 w-5 object-contain" />
                      ) : (
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <h2 className="text-sm font-bold">{bank.name}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {accounts.length} account{accounts.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {accounts.map((account) => (
                      <AccountRow
                        key={account.cbu}
                        account={account}
                        bankName={bank.name}
                        onDeposit={(a) => openRecord(a, "DEPOSIT")}
                        onWithdraw={(a) => openRecord(a, "WITHDRAW")}
                        onTransfer={(a) => openRecord(a, "TRANSFER")}
                        onHistory={openHistory}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </QueryBoundary>

      <AddAccountDialog
        account={editAccount}
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={async (data: AccountRequest) => { await createAccount(data); }}
        onUpdate={async (cbu: string, data: UpdateAccountRequest) => { await updateAccount({ cbu, data }); }}
      />

      {recordAccount && (
        <RecordTransactionDialog
          open={recordOpen}
          onOpenChange={setRecordOpen}
          mode={recordMode}
          account={recordAccount}
        />
      )}

      {historyAccount && (
        <TransactionHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          accountCbu={historyAccount.cbu}
          accountName={historyAccount.name}
          currency={historyAccount.currency}
        />
      )}

      <ConfirmDialog />

      <p className="pt-2 text-center text-xs text-muted-foreground/70">
        Account balances may take a few moments to update after a transaction.
      </p>
    </div>
  );
}
