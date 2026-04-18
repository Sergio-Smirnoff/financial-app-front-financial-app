import { fetchWrapper } from '../fetch-wrapper';
import { ApiResponse } from '@/types/api';
import { BankResponse, BankRequest, AccountResponse, AccountRequest } from '@/types/banks';

export const banksApi = {
  list: () => 
    fetchWrapper.get<ApiResponse<BankResponse[]>>('/api/v1/banks'),
  
  get: (id: number) => 
    fetchWrapper.get<ApiResponse<BankResponse>>(`/api/v1/banks/${id}`),
  
  create: (data: BankRequest) => 
    fetchWrapper.post<ApiResponse<BankResponse>>('/api/v1/banks', data),
  
  update: (id: number, data: BankRequest) => 
    fetchWrapper.put<ApiResponse<BankResponse>>(`/api/v1/banks/${id}`, data),
  
  delete: (id: number) => 
    fetchWrapper.delete<ApiResponse<void>>(`/api/v1/banks/${id}`),

  accounts: {
    list: () => 
      fetchWrapper.get<ApiResponse<AccountResponse[]>>('/api/v1/banks/accounts'),
    
    create: (data: AccountRequest) => 
      fetchWrapper.post<ApiResponse<AccountResponse>>('/api/v1/banks/accounts', data),
    
    update: (id: number, data: AccountRequest) => 
      fetchWrapper.put<ApiResponse<AccountResponse>>(`/api/v1/banks/accounts/${id}`, data),
    
    delete: (id: number) => 
      fetchWrapper.delete<ApiResponse<void>>(`/api/v1/banks/accounts/${id}`),
  }
};
