import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { toast } from 'sonner';
import { daoGovernanceClient } from '@/lib/sui-client';

// Define query keys for React Query
const QUERY_KEYS = {
  DAO_PROPOSALS: 'dao-proposals',
  PROPOSAL_DETAILS: 'proposal-details'
};

// Define the parameters for voting on a proposal
export interface VoteOnProposalParams {
  daoId: string;
  proposalId: number;
  vote: boolean; // true for "for", false for "against"
}

// Hook for voting on a proposal
export function useVoteOnProposal() {
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

  return useMutation({
    mutationFn: async ({ daoId, proposalId, vote }: VoteOnProposalParams) => {
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet not connected');
      }

      // Get the system clock object ID (needed for time-based operations)
      const clockId = '0x6'; // This is the standard clock object ID on Sui

      // Create the transaction for voting
      const tx = daoGovernanceClient.voteOnProposal(
        daoId, 
        { proposal_id: proposalId, vote }, 
        clockId
      );
      
      // Save vote to localStorage as a backup (in case blockchain indexing is delayed)
      if (typeof window !== 'undefined') {
        try {
          const voteKey = `vote-${daoId}-${proposalId}`;
          localStorage.setItem(voteKey, JSON.stringify({
            daoId,
            proposalId,
            vote,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('Error saving vote to localStorage:', error);
        }
      }

      // Execute the transaction
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
              // Log the transaction digest to console
              console.log('Vote Transaction Digest:', result.digest);
              console.log('Vote Transaction Details:', result);
              
              // Store the transaction digest in localStorage for reference
              if (typeof window !== 'undefined') {
                try {
                  const txKey = `vote-tx-${daoId}-${proposalId}`;
                  localStorage.setItem(txKey, result.digest);
                } catch (error) {
                  console.error('Error saving transaction digest to localStorage:', error);
                }
              }
              
              resolve(result);
            },
            onError: (error) => {
              console.error('Vote transaction error:', error);
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: (result, { daoId, proposalId, vote }) => {
      toast.success(`Vote ${vote ? 'for' : 'against'} recorded successfully!`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.DAO_PROPOSALS, daoId] 
      });
      
      // Also invalidate the specific proposal if there's a query for it
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROPOSAL_DETAILS, daoId, proposalId]
      });
    },
    onError: (error) => {
      console.error('Error voting on proposal:', error);
      toast.error('Failed to record your vote. Please try again.');
    },
  });
}
