"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountsTab } from "./AccountsTab";
import { CardsTab } from "./CardsTab";
import { LoansTab } from "./LoansTab";

export function BanksContent() {
  return (
    <div className="w-full p-8">
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="mt-6"><AccountsTab /></TabsContent>
        <TabsContent value="cards" className="mt-6"><CardsTab /></TabsContent>
        <TabsContent value="loans" className="mt-6"><LoansTab /></TabsContent>
      </Tabs>
    </div>
  );
}
