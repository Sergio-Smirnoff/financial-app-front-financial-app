import { BanksContent } from "@/components/pages/banks/BanksContent";
import { Header } from "@/components/layout/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banks | Financial App",
  description: "Manage your banks and accounts",
};

export default function BanksPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <Header title="Banks" />
      <main className="flex-1 overflow-y-auto">
        <BanksContent />
      </main>
    </div>
  );
}
