"use client";

import { useState, useEffect } from "react";
import { BankResponse, BankRequest } from "@/types/banks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankFormDialogProps {
  bank?: BankResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BankRequest) => Promise<void>;
}

export function BankFormDialog({ bank, open, onOpenChange, onSubmit }: BankFormDialogProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bank) {
      setName(bank.name);
      setLogoUrl(bank.logoUrl || "");
    } else {
      setName("");
      setLogoUrl("");
    }
  }, [bank, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, logoUrl });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>{bank ? "Edit Bank" : "Add Bank"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Bank Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Chase, Bank of America" 
              className="bg-background border-border"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo" className="text-muted-foreground">Logo URL (optional)</Label>
            <Input 
              id="logo" 
              value={logoUrl} 
              onChange={(e) => setLogoUrl(e.target.value)} 
              placeholder="https://example.com/logo.png" 
              className="bg-background border-border"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {bank ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
