"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountResponse, AccountRequest, UpdateAccountRequest } from "@/types/banks";
import { accountSchema, AccountFormValues } from "@/lib/schemas/account";
import { useAvailableBanks, useBankCatalog } from "@/lib/hooks/useBanks";
import { CURRENCIES } from "@/lib/format";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api/client";

const ACCOUNT_TYPE_KEYS: Record<string, string> = {
  CHECKING: "dialogs.addAccount.accountType.CHECKING",
  SAVINGS: "dialogs.addAccount.accountType.SAVINGS",
};

interface Props {
  account?: AccountResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: AccountRequest) => Promise<void>;
  onUpdate: (cbu: string, data: UpdateAccountRequest) => Promise<void>;
}

export function AddAccountDialog({ account, open, onOpenChange, onCreate, onUpdate }: Props) {
  const t = useTranslations("banks");
  const tc = useTranslations("common");
  const { data: availableBanks } = useAvailableBanks();
  const { data: catalog } = useBankCatalog();
  const isEdit = !!account;
  const [pendingValues, setPendingValues] = useState<AccountFormValues | null>(null);

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

  const createAccount = async (v: AccountFormValues) => {
    try {
      await onCreate({ bankNumber: v.bankNumber, name: v.name, type: v.type, currency: v.currency, cbu: v.cbu, alias: v.alias || undefined, isActive: true });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("dialogs.addAccount.errorSave");
      if (error instanceof ApiError && error.code === "resource_already_exists") {
        form.setError("name", { message });
      }
      toast.error(message);
    }
  };

  const onSubmit = async (v: AccountFormValues) => {
    if (isEdit && account) {
      try {
        await onUpdate(account.cbu, { name: v.name, currency: v.currency });
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("dialogs.addAccount.errorSave"));
      }
      return;
    }
    if (!v.alias || v.alias.trim() === "") {
      setPendingValues(v);
      return;
    }
    await createAccount(v);
  };

  const accountTypes = (catalog?.accountTypes ?? ["CHECKING", "SAVINGS"]).filter((accountType) => accountType !== "INVESTMENT");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-popover border-border">
          <DialogHeader><DialogTitle>{isEdit ? t("dialogs.addAccount.editTitle") : t("dialogs.addAccount.addTitle")}</DialogTitle><DialogDescription>{t("dialogs.addAccount.description")}</DialogDescription></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="bankNumber" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-muted-foreground">{t("dialogs.shared.fieldBank")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                    <FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder={t("dialogs.shared.selectBankPlaceholder")} /></SelectTrigger></FormControl>
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
                  <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">{t("dialogs.addAccount.fieldName")}</FormLabel>
                    <FormControl><Input {...field} placeholder={t("dialogs.addAccount.namePlaceholder")} className="bg-background border-border" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="alias" render={({ field }) => (
                  <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">{t("dialogs.addAccount.fieldAlias")}</FormLabel>
                    <FormControl><Input {...field} placeholder={t("dialogs.addAccount.aliasPlaceholder")} className="bg-background border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">{t("dialogs.shared.fieldType")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                      <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="bg-popover border-border">
                        {accountTypes.map((accountType) => {
                          const typeKey = ACCOUNT_TYPE_KEYS[accountType];
                          return <SelectItem key={accountType} value={accountType}>{typeKey ? t(typeKey) : accountType}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">{t("dialogs.shared.fieldCurrency")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="bg-popover border-border">
                        {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="cbu" render={({ field }) => (
                <FormItem className="space-y-2"><FormLabel className="text-muted-foreground">{t("dialogs.addAccount.fieldCbu")}</FormLabel>
                  <FormControl><Input {...field} disabled={isEdit} inputMode="numeric" maxLength={22} placeholder="0070009000000000000017" className="bg-background border-border tracking-widest" /></FormControl><FormMessage /></FormItem>
              )} />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">{tc("cancel")}</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>{isEdit ? t("dialogs.shared.update") : t("dialogs.shared.create")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingValues} onOpenChange={(o) => { if (!o) setPendingValues(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialogs.addAccount.noAliasTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.addAccount.noAliasDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingValues(null)}>{t("dialogs.addAccount.goBack")}</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { const v = pendingValues!; setPendingValues(null); await createAccount(v); }}>
              {t("dialogs.addAccount.useCbuAsAlias")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
