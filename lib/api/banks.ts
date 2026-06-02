import { api } from './client';
import { BankResponse, AvailableBank, BankingCatalog, AccountResponse, AccountRequest, UpdateAccountRequest } from '@/types/banks';
import { AccountTransactionRow } from '@/types/finances';

export const banksApi = {
  list: () => api.get<BankResponse[]>('/api/v1/banks'),
  available: () => api.get<AvailableBank[]>('/api/v1/banks/available'),
  metadata: () => api.get<BankingCatalog>('/api/v1/banks/metadata'),
  getByNumber: (bankNumber: string) => api.get<BankResponse>(`/api/v1/banks/${bankNumber}`),

  accounts: {
    list: () => api.get<AccountResponse[]>('/api/v1/banks/accounts'),
    get: (cbu: string) => api.get<AccountResponse>(`/api/v1/banks/accounts/${cbu}`),
    create: (data: AccountRequest) => api.post<AccountResponse>('/api/v1/banks/accounts', data),
    update: (cbu: string, data: UpdateAccountRequest) => api.patch<AccountResponse>(`/api/v1/banks/accounts/${cbu}`, data),
    delete: (cbu: string) => api.delete<void>(`/api/v1/banks/accounts/${cbu}`),
    transactions: (cbu: string, params?: { limit?: number; from?: string; to?: string }) => {
      const qs = new URLSearchParams();
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.from) qs.set('from', params.from);
      if (params?.to) qs.set('to', params.to);
      const s = qs.toString();
      return api.get<AccountTransactionRow[]>(`/api/v1/banks/accounts/${cbu}/transactions${s ? `?${s}` : ''}`);
    },
  },
};
