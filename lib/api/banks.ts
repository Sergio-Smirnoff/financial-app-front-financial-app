import { api } from './client';
import { BankResponse, BankRequest, AccountResponse, AccountRequest } from '@/types/banks';

export const banksApi = {
  list: () => 
    api.get<BankResponse[]>('/api/v1/banks'),
  
  get: (id: number) => 
    api.get<BankResponse>(`/api/v1/banks/${id}`),
  
  create: (data: BankRequest) => 
    api.post<BankResponse>('/api/v1/banks', data),
  
  update: (id: number, data: BankRequest) => 
    api.put<BankResponse>(`/api/v1/banks/${id}`, data),
  
  delete: (id: number) => 
    api.delete<void>(`/api/v1/banks/${id}`),

  accounts: {
    list: () => 
      api.get<AccountResponse[]>('/api/v1/banks/accounts'),
    
    create: (data: AccountRequest) => 
      api.post<AccountResponse>('/api/v1/banks/accounts', data),
    
    update: (id: number, data: AccountRequest) => 
      api.put<AccountResponse>(`/api/v1/banks/accounts/${id}`, data),
    
    delete: (id: number) => 
      api.delete<void>(`/api/v1/banks/accounts/${id}`),
  }
};
