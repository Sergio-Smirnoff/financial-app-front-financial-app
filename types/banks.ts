export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT';

export interface AccountResponse {
  bankNumber: string;
  userId: number;
  name: string;
  type: AccountType;
  balance: string;
  currency: string;
  cbu: string;
  alias: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankResponse {
  bankNumber: string;
  name: string;
  logoUrl?: string;
  accounts: AccountResponse[];
  totalBalances: Record<string, string>;
  accountsCount: number;
}

export interface AvailableBank {
  bankNumber: string;
  name: string;
  logoUrl?: string;
}

export interface BankingCatalog {
  accountTypes: string[];
  cardTypes: string[];
  cardBrands: string[];
  cardBehaviors: string[];
}

export interface AccountRequest {
  bankNumber: string;
  name: string;
  type: AccountType;
  currency: string;
  cbu: string;
  alias?: string;
  isActive?: boolean;
}

export interface UpdateAccountRequest {
  name?: string;
  balance?: string;
  currency?: string;
  isActive?: boolean;
}
