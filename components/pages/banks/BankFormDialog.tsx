"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BankResponse, BankRequest } from "@/types/banks";
import { bankSchema, BankFormValues } from "@/lib/schemas/bank";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface BankFormDialogProps {
  bank?: BankResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BankRequest) => Promise<void>;
}

export function BankFormDialog({ bank, open, onOpenChange, onSubmit }: BankFormDialogProps) {
  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (bank) {
        form.reset({
          name: bank.name,
          logoUrl: bank.logoUrl || "",
        });
      } else {
        form.reset({
          name: "",
          logoUrl: "",
        });
      }
    }
  }, [bank, open, form]);

  const onFormSubmit = async (values: BankFormValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit bank form:", error);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>{bank ? "Edit Bank" : "Add Bank"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-muted-foreground">Bank Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="e.g. Chase, Bank of America" 
                      className="bg-background border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-muted-foreground">Logo URL (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="https://example.com/logo.png" 
                      className="bg-background border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : (bank ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
