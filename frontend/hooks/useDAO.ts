import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignAndExecuteTransactionBlock, useCurrentAccount } from '@mysten/dapp-kit';
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
import { useState, useEffect } from 'react';

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
    staleTime: 60000, // 1 minute
  });
}

// Hook for checking if user is a member of a DAO
export function useDAOMembership(daoId: string | null) {
  const currentAccount = useCurrentAccount();
  
  return useQuery({
    queryKey: ['dao-membership', daoId, currentAccount?.address],
    queryFn: async () => {
      if (!daoId || !currentAccount?.address) {
        return { isMember: false, votingPower: 0 };
      }
      
      // Check local storage first
      const storageKey = `dao-membership-${daoId}-${currentAccount.address}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          return parsedData;
        } catch (error) {
          console.error('Error parsing stored membership data:', error);
        }
      }
      
      // If not in local storage, check on-chain
      const membershipData = await daoGovernanceClient.checkDAOMembership(daoId, currentAccount.address);
      
      // Store the result in local storage
      if (membershipData.isMember) {
        localStorage.setItem(storageKey, JSON.stringify(membershipData));
      }
      
      return membershipData;
    },
    enabled: !!daoId && !!currentAccount?.address,
    staleTime: 60000, // 1 minute
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
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async (params: CreateDAOParams) => {
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      console.log('Creating DAO with params:', params);
      
      try {
        const tx = daoGovernanceClient.createDAO(params);
        console.log('Transaction created:', tx);
        
        return new Promise((resolve, reject) => {
          signAndExecuteTransactionBlock(
            {
              transactionBlock: tx,
              options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
              },
            },
            {
              onSuccess: (result) => {
                console.log('Transaction successful:', result);
                
                // Extract DAO ID from the result
                try {
                  const objectChanges = result.objectChanges;
                  console.log('Object changes:', objectChanges);
                  
                  // Find the created DAO object
                  const createdDAO = objectChanges?.find((change: any) => 
                    change.type === 'created' && 
                    change.objectType?.includes('::dao_governance::DAO')
                  );
                  
                  if (createdDAO) {
                    const daoId = createdDAO.objectId;
                    console.log('DAO ID extracted:', daoId);
                    
                    // Store in localStorage for persistence
                    localStorage.setItem('currentDAOId', daoId);
                    localStorage.setItem('currentDAOName', params.name);
                    
                    // Trigger custom event to notify other components
                    window.dispatchEvent(new CustomEvent('dao-created', { 
                      detail: { daoId, name: params.name } 
                    }));
                    
                    // Add DAO ID to the result
                    const resultWithDAOId = { ...result, daoId };
                    resolve(resultWithDAOId);
                  } else {
                    console.log('Could not find DAO in object changes');
                    resolve(result);
                  }
                } catch (error) {
                  console.error('Error extracting DAO ID:', error);
                  resolve(result);
                }
              },
              onError: (error) => {
                console.error('Transaction failed:', error);
                reject(error);
              },
            }
          );
        });
      } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }
    },
    onSuccess: (result: any) => {
      console.log('DAO creation successful:', result);
      
      if (result.daoId) {
        toast.success(`DAO created successfully! DAO ID: ${result.daoId.substring(0, 8)}...`);
      } else {
        toast.success('DAO created successfully!');
      }
      
      // Invalidate and refetch user DAOs
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_DAOS, currentAccount?.address] 
      });
    },
    onError: (error) => {
      console.error('Error creating DAO:', error);
      
      // Better error messages
      if (error.message?.includes('package')) {
        toast.error('Smart contract not found. Please check if the DAO contract is deployed on testnet.');
      } else if (error.message?.includes('Insufficient')) {
        toast.error('Insufficient balance. Please ensure you have enough SUI for gas fees.');
      } else {
        toast.error('Failed to create DAO. Please check console for details.');
      }
    },
  });
}

// Hook for funding treasury
export function useFundTreasury() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

  return useMutation({
    mutationFn: async ({ daoId, amount }: { daoId: string; amount: number }) => {
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.fundTreasury(daoId, amount);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransactionBlock(
          {
            transactionBlock: tx,
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
  const queryClient = useQueryClient()
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock()
  
  return useMutation({
    mutationFn: async ({ daoId, votingPower, sender }: { daoId: string, votingPower: number, sender?: string }) => {
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      // Use the imported daoGovernanceClient from the top of the file
      const tx = await daoGovernanceClient.registerMember(daoId, votingPower);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransactionBlock(
          {
            transactionBlock: tx,
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
    onSuccess: (result: any, { daoId, votingPower }) => {
      toast.success('Successfully registered as member!');
      
      // Invalidate DAO details to refresh member count
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_DETAILS, daoId] 
      });
      
      // Get current account address from the transaction result
      // The sender address is available in the transaction digest
      try {
        // Get the sender address from the transaction result if available
        let address = '';
        
        // For Sui transactions, the address might be in different places depending on the SDK version
        if (result) {
          // Try different paths where the address might be stored
          if (typeof result === 'object') {
            // Try to get address from transaction data if available
            if (result.transaction?.data?.sender) {
              address = result.transaction.data.sender;
            } 
            // Try to get from sender property
            else if (result.sender) {
              address = result.sender;
            }
          }
        }
        
        // If we still have no address, try to get it from localStorage
        if (!address) {
          const walletData = localStorage.getItem('wallet');
          if (walletData) {
            try {
              const parsed = JSON.parse(walletData);
              address = parsed.currentAccount?.address || '';
            } catch (e) {
              console.error('Error parsing wallet data:', e);
            }
          }
        }
        
        if (address) {
          // Store membership info in localStorage
          const storageKey = `dao-membership-${daoId}-${address}`;
          localStorage.setItem(storageKey, JSON.stringify({ isMember: true, votingPower }));
          
          // Invalidate membership query
          queryClient.invalidateQueries({
            queryKey: ['dao-membership', daoId, address]
          });
        }
      } catch (error) {
        console.error('Error storing membership data:', error);
      }
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
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

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
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.createProposal(daoId, params, clockId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransactionBlock(
          {
            transactionBlock: tx,
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
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

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
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.voteOnProposal(daoId, params, clockId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransactionBlock(
          {
            transactionBlock: tx,
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
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

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
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.processProposal(daoId, proposalId, clockId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransactionBlock(
          {
            transactionBlock: tx,
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
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

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
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.executeProposal(daoId, proposalId, clockId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransactionBlock(
          {
            transactionBlock: tx,
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
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({ 
      daoId, 
      params 
    }: { 
      daoId: string; 
      params: StakeParams;
    }) => {
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.stakeOnValidator(daoId, params);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransactionBlock(
          {
            transactionBlock: tx,
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
      toast.success('Staked successfully!');
      
      // Invalidate user stakes and DAO details
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_STAKES, currentAccount?.address] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_DETAILS, daoId] 
      });
    },
    onError: (error) => {
      console.error('Error staking:', error);
      toast.error('Failed to stake. Please try again.');
    },
  });
}

// Hook for claiming rewards
export function useClaimRewards() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({ 
      daoId, 
      stakeId 
    }: { 
      daoId: string; 
      stakeId: string;
    }) => {
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      const tx = daoGovernanceClient.claimRewards(daoId, stakeId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransactionBlock(
          {
            transactionBlock: tx,
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

// Utility hook to get current DAO ID
export function useCurrentDAO() {
  const [currentDAOId, setCurrentDAOId] = useState<string | null>(null);
  const [currentDAOName, setCurrentDAOName] = useState<string | null>(null);

  useEffect(() => {
    // Get from localStorage on mount
    const daoId = localStorage.getItem('currentDAOId');
    const daoName = localStorage.getItem('currentDAOName');
    
    setCurrentDAOId(daoId);
    setCurrentDAOName(daoName);
    
    // Listen for storage changes
    const handleStorageChange = () => {
      const newDaoId = localStorage.getItem('currentDAOId');
      const newDaoName = localStorage.getItem('currentDAOName');
      setCurrentDAOId(newDaoId);
      setCurrentDAOName(newDaoName);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const clearCurrentDAO = () => {
    localStorage.removeItem('currentDAOId');
    localStorage.removeItem('currentDAOName');
    setCurrentDAOId(null);
    setCurrentDAOName(null);
  };

  return {
    currentDAOId,
    currentDAOName,
    clearCurrentDAO,
    hasDAO: !!currentDAOId,
  };
} 