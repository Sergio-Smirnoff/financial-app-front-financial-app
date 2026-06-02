"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountResponse, AccountRequest, UpdateAccountRequest } from "@/types/banks";
import { accountSchema, AccountFormValues } from "@/lib/schemas/account";
import { useAvailableBanks, useBankCatalog } from "@/lib/hooks/useBanks";
import { CURRENCIES } from "@/lib/utils/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Props {
  account?: AccountResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: AccountRequest) => Promise<void>;
  onUpdate: (cbu: string, data: UpdateAccountRequest) => Promise<void>;
}

export function AddAccountDialog({ account, open, onOpenChange, onCreate, onUpdate }: Props) {
  const { data: availableBanks } = useAvailableBanks();
  const { data: catalog } = useBankCatalog();
  const isEdit = !!account;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { bankNumber: "", name: "", type: "CHECKING", currency: "USD", cbu: "", alias: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (account) {
      form.reset({
        bankNumber: account.bankNumber, name: account.name, type: account.type,
        currency: account.currency, cbu: account.cbu, alias: account.alias ?? "",
      });
    } else {
      form.reset({ bankNumber: "", name: "", type: "CHECKING", currency: "USD", cbu: "", alias: "" });
    }
  }, [account, open, form]);

  const onSubmit = async (v: AccountFormValues) => {
    try {
      if (isEdit && account) {
        await onUpdate(account.cbu, { name: v.name, currency: v.currency });
      } else {
        await onCreate({ bankNumber: v.bankNumber, name: v.name, type: v.type, currency: v.currency, cbu: v.cbu, alias: v.alias || undefined, isActive: true });
      }
      onOpenChange(false);
    } catch { /* toast handled by mutation */ }
  };

  const accountTypes = catalog?.accountTypes ?? ["CHECKING", "SAVINGS", "INVESTMENT"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Account" : "Add Account"}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="bankNumber" render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-muted-foreground">Bank</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                  <FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select bank" /></SelectTrigger></FormControl>
                  <SelectContent className="bg-popover border-border">
                    {(availableBanks ?? []).map((b) => (
                      <SelectItem key={b.bankNumber} value={b.bankNumber}>{b.bankNumber} — {b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">Account name</FormLabel>
                  <FormControl><Input {...field} placeholder="Sueldo" className="bg-background border-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="alias" render={({ field }) => (
                <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">Alias (optional)</FormLabel>
                  <FormControl><Input {...field} placeholder="sergi.sueldo" className="bg-background border-border" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                    <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-popover border-border">
                      {accountTypes.map((t) => <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">Currency</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-popover border-border">
                      {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="cbu" render={({ field }) => (
              <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">CBU (22 digits)</FormLabel>
                <FormControl><Input {...field} disabled={isEdit} inputMode="numeric" maxLength={22} placeholder="0070009000000000000017" className="bg-background border-border tracking-widest" /></FormControl><FormMessage /></FormItem>
            )} />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>{isEdit ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
