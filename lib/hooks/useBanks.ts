import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { banksApi } from '../api/banks';
import { AccountRequest, UpdateAccountRequest } from '@/types/banks';
import { toast } from 'sonner';

export const useBanks = () => {
  const banksQuery = useQuery({ queryKey: ['banks'], queryFn: () => banksApi.list() });
  return {
    banks: banksQuery.data ?? [],
    isLoading: banksQuery.isLoading,
    isError: banksQuery.isError,
    error: banksQuery.error,
  };
};

export const useAvailableBanks = () =>
  useQuery({ queryKey: ['banks', 'available'], queryFn: () => banksApi.available() });

export const useBankCatalog = () =>
  useQuery({ queryKey: ['banks', 'metadata'], queryFn: () => banksApi.metadata(), staleTime: 60 * 60 * 1000 });

export const useBank = (bankNumber: string) =>
  useQuery({ queryKey: ['banks', bankNumber], queryFn: () => banksApi.getByNumber(bankNumber), enabled: !!bankNumber });

export const useAccounts = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['banks'] });
    // the banks page renders from the BFF cache, a separate namespace prefix matching never reaches
    qc.invalidateQueries({ queryKey: ['bff', 'banks'] });
  };

  const createAccount = useMutation({
    mutationFn: (data: AccountRequest) => banksApi.accounts.create(data),
    onSuccess: () => { invalidate(); toast.success('Account created'); },
    onError: (e: any) => toast.error(e.message || 'Failed to create account'),
  });
  const updateAccount = useMutation({
    mutationFn: ({ cbu, data }: { cbu: string; data: UpdateAccountRequest }) => banksApi.accounts.update(cbu, data),
    onSuccess: () => { invalidate(); toast.success('Account updated'); },
    onError: (e: any) => toast.error(e.message || 'Failed to update account'),
  });
  const deleteAccount = useMutation({
    mutationFn: (cbu: string) => banksApi.accounts.delete(cbu),
    onSuccess: () => { invalidate(); toast.success('Account deleted'); },
    onError: (e: any) => toast.error(e.message || 'Failed to delete account'),
  });

  return {
    createAccount: createAccount.mutateAsync,
    updateAccount: updateAccount.mutateAsync,
    deleteAccount: deleteAccount.mutateAsync,
  };
};
