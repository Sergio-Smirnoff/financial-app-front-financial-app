"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AccountsTab } from "./AccountsTab";
import { CardsTab } from "./CardsTab";
import { LoansTab } from "./LoansTab";

export function BanksContent() {
  return (
    <div className="w-full p-8">
      <Tabs defaultValue="accounts" className="w-full">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
          </TabsList>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/transactions">
              <Receipt className="h-4 w-4" />
              All transactions
            </Link>
          </Button>
        </div>
        <TabsContent value="accounts" className="mt-6"><AccountsTab /></TabsContent>
        <TabsContent value="cards" className="mt-6"><CardsTab /></TabsContent>
        <TabsContent value="loans" className="mt-6"><LoansTab /></TabsContent>
      </Tabs>
    </div>
  );
}
