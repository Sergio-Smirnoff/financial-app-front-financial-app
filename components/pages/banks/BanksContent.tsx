"use client";

import { useState } from "react";
import { useBanks, useAccounts } from "@/lib/hooks/useBanks";
import { BankCard } from "./BankCard";
import { BankFormDialog } from "./BankFormDialog";
import { AccountFormDialog } from "./AccountFormDialog";
import { Button } from "@/components/ui/button";
import { Plus, Building2, LayoutGrid, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BankResponse, AccountResponse } from "@/types/banks";

export function BanksContent() {
  const { banks, isLoading, createBank, updateBank, deleteBank } = useBanks();
  const { createAccount, updateAccount, deleteAccount } = useAccounts();

  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [accDialogOpen, setAccDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankResponse | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);

  const handleAddBank = () => {
    setSelectedBank(null);
    setBankDialogOpen(true);
  };

  const handleEditBank = (bank: BankResponse) => {
    setSelectedBank(bank);
    setBankDialogOpen(true);
  };

  const handleAddAccount = (bankId: number) => {
    setSelectedBankId(bankId);
    setSelectedAccount(null);
    setAccDialogOpen(true);
  };

  const handleEditAccount = (bankId: number, account: AccountResponse) => {
    setSelectedBankId(bankId);
    setSelectedAccount(account);
    setAccDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banks</h1>
          <p className="text-zinc-500">Manage your financial institutions and accounts</p>
        </div>
        <Button onClick={handleAddBank} className="h-10 px-4 py-2 gap-2 shadow-sm transition-all hover:shadow-md">
          <Plus className="h-4 w-4" />
          <span>Add Bank</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
          ))}
        </div>
      ) : banks.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 mb-6">
            <Building2 className="h-10 w-10 text-zinc-300" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No banks found</h2>
          <p className="max-w-[300px] text-zinc-500 mb-8">
            Add your first bank to start tracking your accounts and cards.
          </p>
          <Button onClick={handleAddBank} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add your first bank</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank) => (
            <BankCard 
              key={bank.id} 
              bank={bank} 
              onEdit={handleEditBank}
              onDelete={deleteBank}
              onAddAccount={handleAddAccount}
              onEditAccount={handleEditAccount}
              onDeleteAccount={deleteAccount}
            />
          ))}
        </div>
      )}

      <BankFormDialog 
        open={bankDialogOpen} 
        onOpenChange={setBankDialogOpen} 
        bank={selectedBank}
        onSubmit={async (data) => {
          if (selectedBank) {
            await updateBank({ id: selectedBank.id, data });
          } else {
            await createBank(data);
          }
        }}
      />

      {selectedBankId && (
        <AccountFormDialog 
          open={accDialogOpen} 
          onOpenChange={setAccDialogOpen} 
          bankId={selectedBankId}
          account={selectedAccount}
          onSubmit={async (data) => {
            if (selectedAccount) {
              await updateAccount({ id: selectedAccount.id, data });
            } else {
              await createAccount(data);
            }
          }}
        />
      )}
    </div>
  );
}
