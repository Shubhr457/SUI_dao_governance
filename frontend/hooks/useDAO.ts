import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { daoGovernanceClient, mistToSui } from '@/lib/sui-client';
import { 
  CreateDAOParams, 
  CreateProposalParams, 
  VoteParams, 
  StakeParams,
  DAO,
  Stake 
} from '@/lib/types';
import { toast } from 'sonner';

// Query keys
const QUERY_KEYS = {
  DAO_DETAILS: 'dao-details',
  USER_DAOS: 'user-daos',
  USER_STAKES: 'user-stakes',
  DAO_EVENTS: 'dao-events',
  SHARED_DAOS: 'shared-daos',
};

// Hook for getting DAO details
export function useDAODetails(daoId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.DAO_DETAILS, daoId],
    queryFn: () => daoId ? daoGovernanceClient.getDAODetails(daoId) : null,
    enabled: !!daoId,
    staleTime: 30000, // 30 seconds
  });
}

// Hook for getting user's DAOs (where they have AdminCap)
export function useUserDAOs() {
  const currentAccount = useCurrentAccount();
  
  return useQuery({
    queryKey: [QUERY_KEYS.USER_DAOS, currentAccount?.address],
    queryFn: () => 
      currentAccount?.address 
        ? daoGovernanceClient.getDAOsByOwner(currentAccount.address)
        : [],
    enabled: !!currentAccount?.address,
    staleTime: 60000, // 1 minute
  });
}

// Hook for getting user's stakes
export function useUserStakes() {
  const currentAccount = useCurrentAccount();
  
  return useQuery({
    queryKey: [QUERY_KEYS.USER_STAKES, currentAccount?.address],
    queryFn: () => 
      currentAccount?.address 
        ? daoGovernanceClient.getStakesByOwner(currentAccount.address)
        : [],
    enabled: !!currentAccount?.address,
    staleTime: 30000,
  });
}

// Hook for getting DAO events
export function useDAOEvents(daoId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.DAO_EVENTS, daoId],
    queryFn: () => daoId ? daoGovernanceClient.getDAOEvents(daoId) : [],
    enabled: !!daoId,
    staleTime: 30000,
  });
}

// Hook for getting shared DAOs
export function useSharedDAOs() {
  return useQuery({
    queryKey: [QUERY_KEYS.SHARED_DAOS],
    queryFn: () => daoGovernanceClient.getSharedDAOs(),
    staleTime: 60000,
  });
}

// Mutation hooks for transactions

// Hook for creating a DAO
export function useCreateDAO() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async (params: CreateDAOParams) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.createDAO(params);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result) => {
      toast.success('DAO created successfully!');
      
      // Invalidate and refetch user DAOs
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_DAOS, currentAccount?.address] 
      });
    },
    onError: (error) => {
      console.error('Error creating DAO:', error);
      toast.error('Failed to create DAO. Please try again.');
    },
  });
}

// Hook for funding treasury
export function useFundTreasury() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ daoId, amount }: { daoId: string; amount: number }) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.fundTreasury(daoId, amount);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId }) => {
      toast.success('Treasury funded successfully!');
      
      // Invalidate DAO details to refresh treasury balance
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_DETAILS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error funding treasury:', error);
      toast.error('Failed to fund treasury. Please try again.');
    },
  });
}

// Hook for registering as member
export function useRegisterMember() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ daoId, votingPower }: { daoId: string; votingPower: number }) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.registerMember(daoId, votingPower);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId }) => {
      toast.success('Successfully registered as member!');
      
      // Invalidate DAO details to refresh member count
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_DETAILS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error registering member:', error);
      toast.error('Failed to register as member. Please try again.');
    },
  });
}

// Hook for creating a proposal
export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ 
      daoId, 
      params, 
      clockId 
    }: { 
      daoId: string; 
      params: CreateProposalParams; 
      clockId: string;
    }) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.createProposal(daoId, params, clockId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId }) => {
      toast.success('Proposal created successfully!');
      
      // Invalidate DAO details and events
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_DETAILS, daoId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_EVENTS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error creating proposal:', error);
      toast.error('Failed to create proposal. Please try again.');
    },
  });
}

// Hook for voting on proposal
export function useVoteOnProposal() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ 
      daoId, 
      params, 
      clockId 
    }: { 
      daoId: string; 
      params: VoteParams; 
      clockId: string;
    }) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.voteOnProposal(daoId, params, clockId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId }) => {
      toast.success('Vote cast successfully!');
      
      // Invalidate DAO events to refresh vote data
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_EVENTS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error voting on proposal:', error);
      toast.error('Failed to cast vote. Please try again.');
    },
  });
}

// Hook for processing proposal
export function useProcessProposal() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ 
      daoId, 
      proposalId, 
      clockId 
    }: { 
      daoId: string; 
      proposalId: number; 
      clockId: string;
    }) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.processProposal(daoId, proposalId, clockId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId }) => {
      toast.success('Proposal processed successfully!');
      
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_EVENTS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error processing proposal:', error);
      toast.error('Failed to process proposal. Please try again.');
    },
  });
}

// Hook for executing proposal
export function useExecuteProposal() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ 
      daoId, 
      proposalId, 
      clockId 
    }: { 
      daoId: string; 
      proposalId: number; 
      clockId: string;
    }) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.executeProposal(daoId, proposalId, clockId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId }) => {
      toast.success('Proposal executed successfully!');
      
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_DETAILS, daoId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_EVENTS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error executing proposal:', error);
      toast.error('Failed to execute proposal. Please try again.');
    },
  });
}

// Hook for staking on validator
export function useStakeOnValidator() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({ 
      daoId, 
      params 
    }: { 
      daoId: string; 
      params: StakeParams;
    }) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.stakeOnValidator(daoId, params);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId }) => {
      toast.success('Stake created successfully!');
      
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_STAKES, currentAccount?.address] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_DETAILS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error staking on validator:', error);
      toast.error('Failed to create stake. Please try again.');
    },
  });
}

// Hook for claiming rewards
export function useClaimRewards() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({ 
      daoId, 
      stakeId 
    }: { 
      daoId: string; 
      stakeId: string;
    }) => {
      if (!signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.claimRewards(daoId, stakeId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
          {
            onSuccess: (result) => {
              resolve(result);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId }) => {
      toast.success('Rewards claimed successfully!');
      
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_STAKES, currentAccount?.address] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_EVENTS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error claiming rewards:', error);
      toast.error('Failed to claim rewards. Please try again.');
    },
  });
} 