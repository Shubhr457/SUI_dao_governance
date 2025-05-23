import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_CONFIG, DAO_GOVERNANCE_MODULE, FUNCTIONS, OBJECT_TYPES } from './sui-config';
import { 
  CreateDAOParams, 
  CreateProposalParams, 
  VoteParams, 
  StakeParams,
  DAO,
  Proposal,
  ValidatorInfo,
  Stake
} from './types';

// Create Sui client
export const suiClient = new SuiClient({
  url: getFullnodeUrl(SUI_CONFIG.NETWORK as 'testnet' | 'mainnet' | 'devnet' | 'localnet'),
});

// Helper function to convert MIST to SUI (1 SUI = 10^9 MIST)
export const MIST_PER_SUI = 1000000000;

export const suiToMist = (sui: number): number => sui * MIST_PER_SUI;
export const mistToSui = (mist: number): number => mist / MIST_PER_SUI;

// Transaction building functions

export class DAOGovernanceClient {
  private client: SuiClient;

  constructor() {
    this.client = suiClient;
  }

  // Create a new DAO
  createDAO(params: CreateDAOParams): TransactionBlock {
    const tx = new TransactionBlock();
    
    // Convert SUI to MIST for initial treasury
    const treasuryAmount = suiToMist(params.initial_treasury);
    
    // Create coin for initial treasury
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(treasuryAmount)]);
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.CREATE_DAO}`,
      arguments: [
        tx.pure(params.name),
        tx.pure(params.description),
        tx.pure(params.proposal_threshold),
        tx.pure(params.voting_quorum),
        tx.pure(params.voting_threshold),
        tx.pure(params.voting_period),
        tx.pure(params.timelock_period),
        coin,
      ],
    });

    return tx;
  }

  // Fund DAO treasury
  fundTreasury(daoId: string, amount: number): TransactionBlock {
    const tx = new TransactionBlock();
    
    const mistAmount = suiToMist(amount);
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(mistAmount)]);
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.FUND_TREASURY}`,
      arguments: [
        tx.object(daoId),
        coin,
      ],
    });

    return tx;
  }

  // Register as a DAO member
  registerMember(daoId: string, votingPower: number): TransactionBlock {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.REGISTER_MEMBER}`,
      arguments: [
        tx.object(daoId),
        tx.pure(votingPower),
      ],
    });

    return tx;
  }

  // Create a proposal
  createProposal(daoId: string, params: CreateProposalParams, clockId: string): TransactionBlock {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.CREATE_PROPOSAL}`,
      arguments: [
        tx.object(daoId),
        tx.pure(params.title),
        tx.pure(params.description),
        tx.pure(params.proposal_type),
        tx.pure(params.treasury_transfer_amount || 0),
        tx.pure(params.treasury_transfer_recipient || '0x0'),
        tx.pure(params.parameter_key || ''),
        tx.pure(params.parameter_value || 0),
        tx.pure(params.validator_address || '0x0'),
        tx.object(clockId),
      ],
    });

    return tx;
  }

  // Vote on a proposal
  voteOnProposal(daoId: string, params: VoteParams, clockId: string): TransactionBlock {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.VOTE_ON_PROPOSAL}`,
      arguments: [
        tx.object(daoId),
        tx.pure(params.proposal_id),
        tx.pure(params.vote),
        tx.object(clockId),
      ],
    });

    return tx;
  }

  // Process proposal
  processProposal(daoId: string, proposalId: number, clockId: string): TransactionBlock {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.PROCESS_PROPOSAL}`,
      arguments: [
        tx.object(daoId),
        tx.pure(proposalId),
        tx.object(clockId),
      ],
    });

    return tx;
  }

  // Execute proposal
  executeProposal(daoId: string, proposalId: number, clockId: string): TransactionBlock {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.EXECUTE_PROPOSAL}`,
      arguments: [
        tx.object(daoId),
        tx.pure(proposalId),
        tx.object(clockId),
      ],
    });

    return tx;
  }

  // Stake on validator
  stakeOnValidator(daoId: string, params: StakeParams): TransactionBlock {
    const tx = new TransactionBlock();
    
    const mistAmount = suiToMist(params.amount);
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(mistAmount)]);
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.STAKE_ON_VALIDATOR}`,
      arguments: [
        tx.object(daoId),
        tx.pure(params.validator_address),
        coin,
      ],
    });

    return tx;
  }

  // Claim rewards
  claimRewards(daoId: string, stakeId: string): TransactionBlock {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DAO_GOVERNANCE_MODULE}::${FUNCTIONS.CLAIM_REWARDS}`,
      arguments: [
        tx.object(daoId),
        tx.object(stakeId),
      ],
    });

    return tx;
  }

  // Query functions

  // Get all DAOs owned by an address
  async getDAOsByOwner(ownerAddress: string): Promise<any[]> {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: ownerAddress,
        filter: { StructType: OBJECT_TYPES.ADMIN_CAP },
      });
      return objects.data;
    } catch (error) {
      console.error('Error fetching DAOs:', error);
      return [];
    }
  }

  // Get shared DAO objects
  async getSharedDAOs(): Promise<any[]> {
    try {
      // This would require a more complex query or indexing service
      // For now, we'll return empty array
      return [];
    } catch (error) {
      console.error('Error fetching shared DAOs:', error);
      return [];
    }
  }

  // Get DAO object details
  async getDAODetails(daoId: string): Promise<DAO | null> {
    try {
      const object = await this.client.getObject({
        id: daoId,
        options: { showContent: true, showType: true },
      });

      if (object.data?.content && 'fields' in object.data.content) {
        const fields = object.data.content.fields as any;
        
        return {
          id: daoId,
          name: fields.name,
          description: fields.description,
          governance_config: {
            proposal_threshold: Number(fields.governance_config.fields.proposal_threshold),
            voting_quorum: Number(fields.governance_config.fields.voting_quorum),
            voting_threshold: Number(fields.governance_config.fields.voting_threshold),
            voting_period: Number(fields.governance_config.fields.voting_period),
            timelock_period: Number(fields.governance_config.fields.timelock_period),
          },
          treasury_balance: Number(fields.treasury.fields.value),
          proposal_count: Number(fields.proposal_count),
          member_count: Number(fields.member_count),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching DAO details:', error);
      return null;
    }
  }

  // Get stakes owned by an address
  async getStakesByOwner(ownerAddress: string): Promise<Stake[]> {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: ownerAddress,
        filter: { StructType: OBJECT_TYPES.STAKE },
        options: { showContent: true },
      });

      return objects.data
        .filter(obj => obj.data?.content && 'fields' in obj.data.content)
        .map(obj => {
          const fields = (obj.data!.content as any).fields;
          return {
            id: obj.data!.objectId,
            dao_id: fields.dao_id,
            owner: fields.owner,
            validator: fields.validator,
            amount: Number(fields.amount),
            rewards_claimed: Number(fields.rewards_claimed),
          };
        });
    } catch (error) {
      console.error('Error fetching stakes:', error);
      return [];
    }
  }

  // Get events for a DAO
  async getDAOEvents(daoId: string, eventType?: string) {
    try {
      const events = await this.client.queryEvents({
        query: { MoveModule: { package: SUI_CONFIG.PACKAGE_ID, module: 'dao_governance' } },
        limit: 50,
        order: 'descending',
      });
      
      return events.data.filter(event => {
        const parsedJson = event.parsedJson as any;
        return parsedJson?.dao_id === daoId;
      });
    } catch (error) {
      console.error('Error fetching DAO events:', error);
      return [];
    }
  }
}

export const daoGovernanceClient = new DAOGovernanceClient(); 