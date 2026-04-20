export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT';

export interface AccountResponse {
  id: number;
  bankId: number;
  userId: number;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankResponse {
  id: number;
  userId: number;
  name: string;
  logoUrl?: string;
  accounts: AccountResponse[];
  totalBalances: Record<string, number>;
  accountsCount: number;
  cardsCount: number;
  loansCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankRequest {
  name: string;
  logoUrl?: string;
}

export interface AccountRequest {
  bankId: number;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isActive?: boolean;
}
