import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { banksApi } from '../api/banks';
import { BankRequest, AccountRequest } from '@/types/banks';
import { toast } from 'sonner';

export const useBanks = () => {
  const queryClient = useQueryClient();

  const banksQuery = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksApi.list(),
  });

  const createBankMutation = useMutation({
    mutationFn: (data: BankRequest) => banksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast.success('Bank created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create bank');
    },
  });

  const updateBankMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BankRequest }) => 
      banksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast.success('Bank updated successfully');
    },
  });

  const deleteBankMutation = useMutation({
    mutationFn: (id: number) => banksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast.success('Bank deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete bank');
    },
  });

  return {
    banks: banksQuery.data ?? [],
    isLoading: banksQuery.isLoading,
    createBank: createBankMutation.mutateAsync,
    updateBank: updateBankMutation.mutateAsync,
    deleteBank: deleteBankMutation.mutateAsync,
  };
};

export const useBank = (id: number) => {
  return useQuery({
    queryKey: ['banks', id],
    queryFn: () => banksApi.get(id),
    enabled: !!id,
  });
};

export const useAccounts = () => {
  const queryClient = useQueryClient();

  const createAccountMutation = useMutation({
    mutationFn: (data: AccountRequest) => banksApi.accounts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast.success('Account created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create account');
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountRequest }) => 
      banksApi.accounts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast.success('Account updated successfully');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: number) => banksApi.accounts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast.success('Account deleted successfully');
    },
  });

  return {
    createAccount: createAccountMutation.mutateAsync,
    updateAccount: updateAccountMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
  };
};
