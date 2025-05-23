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
    
    let coin;
    if (treasuryAmount > 0) {
      // Create coin for initial treasury
      [coin] = tx.splitCoins(tx.gas, [tx.pure(treasuryAmount)]);
    } else {
      // Create zero-value coin for empty treasury
      [coin] = tx.splitCoins(tx.gas, [tx.pure(0)]);
    }
    
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
          treasury_balance: fields.treasury && fields.treasury.fields ? Number(fields.treasury.fields.value) : 0,
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

  // Check if an address is a member of a DAO
  async checkDAOMembership(daoId: string, address: string): Promise<{isMember: boolean, votingPower: number}> {
    try {
      // Query events for MemberRegisteredEvent
      const events = await this.client.queryEvents({
        query: { MoveEventType: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::MemberRegisteredEvent` },
        limit: 100,
        order: 'descending',
      });
      
      // Filter events for this specific DAO and address
      const memberEvents = events.data.filter(event => {
        const parsedJson = event.parsedJson as any;
        return parsedJson?.dao_id === daoId && parsedJson?.member === address;
      });
      
      if (memberEvents.length > 0) {
        // User is a member, get their voting power from the most recent event
        const mostRecentEvent = memberEvents[0];
        const votingPower = Number((mostRecentEvent.parsedJson as any).voting_power);
        return { isMember: true, votingPower };
      }
      
      // User is not a member
      return { isMember: false, votingPower: 0 };
    } catch (error) {
      console.error('Error checking DAO membership:', error);
      return { isMember: false, votingPower: 0 };
    }
  }

  // Get proposals for a DAO
  async getDAOProposals(daoId: string): Promise<Proposal[]> {
    try {
      // First, get the DAO details to check if it exists
      const daoDetails = await this.getDAODetails(daoId);
      if (!daoDetails) {
        console.log('DAO details not found for ID:', daoId);
        return [];
      }

      // Get proposal creation events for this DAO
      const events = await this.client.queryEvents({
        query: { MoveEventType: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::ProposalCreatedEvent` },
        limit: 50,
        order: 'descending',
      });
      
      console.log('All proposal events found:', events.data.length);
      console.log('Looking for DAO ID:', daoId);
      
      // More flexible filtering for DAO ID
      const daoEvents = events.data.filter(event => {
        const parsedJson = event.parsedJson as any;
        // Log each event's DAO ID for debugging
        console.log('Event DAO ID:', parsedJson?.dao_id, 'Type:', typeof parsedJson?.dao_id);
        
        // Try multiple comparison methods
        return (
          parsedJson?.dao_id === daoId || 
          parsedJson?.dao_id?.toString() === daoId ||
          // Normalize both to lowercase for case-insensitive comparison
          parsedJson?.dao_id?.toLowerCase() === daoId.toLowerCase()
        );
      });
      
      console.log('Filtered proposal events for this DAO:', daoEvents.length);
      
      // If no events found from blockchain, check localStorage for recently created proposals
      if (daoEvents.length === 0 && typeof window !== 'undefined') {
        console.log('No events found from blockchain, checking localStorage for recent proposals');
        const localProposals: Proposal[] = [];
        
        // Check localStorage for any saved proposals
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Look for both formats of keys: 'proposal-<id>' and 'proposal-<daoId>-<id>'
          if (key && key.startsWith('proposal-')) {
            try {
              const storedData = JSON.parse(localStorage.getItem(key) || '{}');
              
              // Check if this proposal belongs to the current DAO
              if (storedData.daoId && 
                  (storedData.daoId === daoId || 
                   storedData.daoId.toLowerCase() === daoId.toLowerCase())) {
                
                console.log('Found locally stored proposal for this DAO:', key);
                
                // Extract proposal ID from the key or use a timestamp
                let proposalId: number;
                const keyParts = key.split('-');
                if (keyParts.length > 2 && !isNaN(Number(keyParts[keyParts.length - 1]))) {
                  proposalId = Number(keyParts[keyParts.length - 1]);
                } else {
                  proposalId = storedData.timestamp ? Math.floor(storedData.timestamp / 1000) : Date.now();
                }
                
                // Handle both storage formats
                let title = '';
                let description = '';
                let proposalType = { code: 0 }; // Default to text proposal
                
                // Check if data is in the proposalEvent format (old format)
                if (storedData.proposalEvent && storedData.proposalEvent.parsedJson) {
                  const eventData = storedData.proposalEvent.parsedJson;
                  title = eventData.title || '';
                  description = eventData.description || '';
                  if (eventData.proposal_type !== undefined) {
                    proposalType = { code: Number(eventData.proposal_type) };
                  }
                } 
                // Check if data is in the direct format (new format)
                else {
                  title = storedData.title || '';
                  description = storedData.description || '';
                  if (storedData.proposal_type !== undefined) {
                    proposalType = { code: Number(storedData.proposal_type) };
                  }
                }
                
                // Create a proposal object from the stored data
                const proposal: Proposal = {
                  id: proposalId,
                  proposer: storedData.proposer || '',
                  title: title,
                  description: description,
                  proposal_type: proposalType,
                  status: { code: 0 }, // Default to active
                  created_at: storedData.timestamp ? Math.floor(storedData.timestamp / 1000) : Math.floor(Date.now() / 1000),
                  voting_ends_at: Math.floor(Date.now() / 1000) + 86400, // Default to 24 hours from now
                  execution_time: 0,
                  yes_votes: 0,
                  no_votes: 0,
                  voters: [],
                  treasury_transfer_amount: 0,
                  treasury_transfer_recipient: '',
                  parameter_key: '',
                  parameter_value: 0,
                  validator_address: ''
                };
                
                localProposals.push(proposal);
              }
            } catch (error) {
              console.error('Error parsing stored proposal:', error);
            }
          }
        }
        
        if (localProposals.length > 0) {
          console.log('Found locally stored proposals:', localProposals);
          return localProposals;
        }
      }

      // Get vote events to calculate current vote tallies
      const voteEvents = await this.client.queryEvents({
        query: { MoveEventType: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::VoteCastEvent` },
        limit: 100,
        order: 'descending',
      });

      // Filter vote events for this DAO with improved matching
      const daoVoteEvents = voteEvents.data.filter(event => {
        const parsedJson = event.parsedJson as any;
        return (
          parsedJson?.dao_id === daoId || 
          parsedJson?.dao_id?.toString() === daoId ||
          parsedJson?.dao_id?.toLowerCase() === daoId.toLowerCase()
        );
      });

      // Get execution events
      const executionEvents = await this.client.queryEvents({
        query: { MoveEventType: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::ProposalExecutedEvent` },
        limit: 50,
        order: 'descending',
      });

      // Filter execution events for this DAO with improved matching
      const daoExecutionEvents = executionEvents.data.filter(event => {
        const parsedJson = event.parsedJson as any;
        return (
          parsedJson?.dao_id === daoId || 
          parsedJson?.dao_id?.toString() === daoId ||
          parsedJson?.dao_id?.toLowerCase() === daoId.toLowerCase()
        );
      });

      // Transform events into proposal objects
      const proposals = daoEvents.map(event => {
        const eventData = event.parsedJson as any;
        const proposalId = Number(eventData.proposal_id);
        
        // Calculate votes for this proposal
        let yesVotes = 0;
        let noVotes = 0;
        const voters: string[] = [];
        
        daoVoteEvents.forEach(voteEvent => {
          const voteData = voteEvent.parsedJson as any;
          if (Number(voteData.proposal_id) === proposalId) {
            const votingPower = Number(voteData.voting_power);
            if (voteData.vote) {
              yesVotes += votingPower;
            } else {
              noVotes += votingPower;
            }
            voters.push(voteData.voter);
          }
        });
        
        // Check if proposal was executed
        const executed = daoExecutionEvents.some(execEvent => {
          const execData = execEvent.parsedJson as any;
          return Number(execData.proposal_id) === proposalId;
        });
        
        // Determine proposal status
        let status = { code: 0 }; // Active by default
        const currentTime = Math.floor(Date.now() / 1000);
        const votingEndsAt = Number(eventData.voting_ends_at);
        
        if (executed) {
          status = { code: 3 }; // Executed
        } else if (currentTime > votingEndsAt) {
          // Voting period ended
          const totalVotes = yesVotes + noVotes;
          const quorum = daoDetails.governance_config.voting_quorum;
          const threshold = daoDetails.governance_config.voting_threshold;
          
          if (totalVotes >= quorum && (yesVotes / totalVotes) * 100 >= threshold) {
            status = { code: 1 }; // Passed
          } else {
            status = { code: 2 }; // Failed
          }
        }
        
        // Create proposal object
        return {
          id: proposalId,
          proposer: eventData.proposer,
          title: eventData.title,
          description: eventData.description || '',
          proposal_type: { code: 0 }, // Default to treasury proposal
          status,
          created_at: Number(event.timestampMs) / 1000,
          voting_ends_at: votingEndsAt,
          execution_time: 0, // This would need to be calculated based on timelock
          yes_votes: yesVotes,
          no_votes: noVotes,
          voters,
          treasury_transfer_amount: 0, // These fields would need to be populated from additional data
          treasury_transfer_recipient: '',
          parameter_key: '',
          parameter_value: 0,
          validator_address: ''
        };
      });
      
      return proposals;
    } catch (error) {
      console.error('Error fetching DAO proposals:', error);
      return [];
    }
  }
}

export const daoGovernanceClient = new DAOGovernanceClient();