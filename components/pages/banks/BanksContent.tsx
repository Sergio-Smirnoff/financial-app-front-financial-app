"use client";

import { useState, useMemo } from "react";
import { useBanks, useAccounts } from "@/lib/hooks/useBanks";
import { BankCard } from "./BankCard";
import { BankFormDialog } from "./BankFormDialog";
import { Button } from "@/components/ui/button";
import { Plus, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { BankResponse } from "@/types/banks";

const ITEMS_PER_PAGE = 6;

export function BanksContent() {
  const { banks, isLoading, createBank, updateBank, deleteBank } = useBanks();
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddBank = () => {
    setSelectedBank(null);
    setBankDialogOpen(true);
  };

  const handleEditBank = (bank: BankResponse) => {
    setSelectedBank(bank);
    setBankDialogOpen(true);
  };

  const totalPages = Math.ceil((banks?.length || 0) / ITEMS_PER_PAGE);
  
  const paginatedBanks = useMemo(() => {
    if (!banks) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return banks.slice(start, start + ITEMS_PER_PAGE);
  }, [banks, currentPage]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pl-8 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pr-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Banks</h1>
          <p className="text-zinc-500 mt-1">Manage your financial institutions and view consolidated summaries</p>
        </div>
        <Button onClick={handleAddBank} className="h-11 px-6 py-2 gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground">
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Add Bank</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pr-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[320px] w-full rounded-2xl animate-pulse bg-zinc-100 border border-zinc-200" />
          ))}
        </div>
      ) : !banks || banks.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center animate-in zoom-in-95 duration-300 mr-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm border mb-6">
            <Building2 className="h-12 w-12 text-zinc-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-zinc-900">No banks found</h2>
          <p className="max-w-[340px] text-zinc-500 mb-8">
            Connect your first financial institution to start tracking your accounts, cards and loans.
          </p>
          <Button onClick={handleAddBank} size="lg" className="gap-2 shadow-md">
            <Plus className="h-5 w-5" />
            <span>Add your first bank</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-8 pr-8 pb-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedBanks.map((bank: BankResponse) => (
              <BankCard 
                key={bank.id} 
                bank={bank} 
                onEdit={handleEditBank}
                onDelete={deleteBank}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-full h-10 w-10 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-full font-medium ${currentPage === page ? 'shadow-md' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full h-10 w-10 shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
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
    </div>
  );
}
