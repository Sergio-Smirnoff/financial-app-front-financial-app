"use client";

import { BankResponse } from "@/types/banks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface BankCardProps {
  bank: BankResponse;
  onEdit: (bank: BankResponse) => void;
  onDelete: (id: number) => void;
  onAddAccount: (bankId: number) => void;
  onEditAccount: (bankId: number, account: any) => void;
  onDeleteAccount: (id: number) => void;
}

export function BankCard({ 
  bank, 
  onEdit, 
  onDelete, 
  onAddAccount,
  onEditAccount,
  onDeleteAccount
}: BankCardProps) {
  return (
    <Card className="overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-zinc-50/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm">
            {bank.logoUrl ? (
              <img src={bank.logoUrl} alt={bank.name} className="h-6 w-6 object-contain" />
            ) : (
              <Building2 className="h-5 w-5 text-zinc-400" />
            )}
          </div>
          <CardTitle className="text-lg font-semibold">{bank.name}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" onClick={() => onEdit(bank)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-600" onClick={() => onDelete(bank.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y border-t">
          {bank.accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-zinc-500">No accounts in this bank</p>
              <Button 
                variant="link" 
                size="sm" 
                className="mt-1 h-auto p-0"
                onClick={() => onAddAccount(bank.id)}
              >
                Add the first one
              </Button>
            </div>
          ) : (
            bank.accounts.map((account) => (
              <div key={account.id} className="group flex items-center justify-between p-4 transition-colors hover:bg-zinc-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{account.name}</span>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal uppercase">
                      {account.type.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500">{account.currency}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" onClick={() => onEditAccount(bank.id, account)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-600" onClick={() => onDeleteAccount(account.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {bank.accounts.length > 0 && (
          <div className="p-2 bg-zinc-50/30 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-9 justify-start gap-2 text-zinc-500 hover:text-zinc-900" 
              onClick={() => onAddAccount(bank.id)}
            >
              <Plus className="h-4 w-4" />
              <span>Add account</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
