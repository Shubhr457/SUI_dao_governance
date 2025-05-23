// Types matching the Move contract structures

export interface DAO {
  id: string;
  name: string;
  description: string;
  governance_config: GovernanceConfig;
  treasury_balance: number;
  proposal_count: number;
  member_count: number;
}

export interface GovernanceConfig {
  proposal_threshold: number;
  voting_quorum: number;
  voting_threshold: number;
  voting_period: number;
  timelock_period: number;
}

export interface Proposal {
  id: number;
  proposer: string;
  title: string;
  description: string;
  proposal_type: ProposalType;
  status: ProposalStatus;
  created_at: number;
  voting_ends_at: number;
  execution_time: number;
  yes_votes: number;
  no_votes: number;
  voters: string[];
  treasury_transfer_amount: number;
  treasury_transfer_recipient: string;
  parameter_key: string;
  parameter_value: number;
  validator_address: string;
}

export interface ProposalType {
  code: number; // 0 = Treasury, 1 = Parameter Change, 2 = Validator, 3 = Custom
}

export interface ProposalStatus {
  code: number; // 0 = Active, 1 = Passed, 2 = Failed, 3 = Executed, 4 = Canceled
}

export interface ValidatorInfo {
  address: string;
  name: string;
  performance_score: number;
  commission_rate: number;
  staked_amount: number;
}

export interface Stake {
  id: string;
  dao_id: string;
  owner: string;
  validator: string;
  amount: number;
  rewards_claimed: number;
}

export interface AdminCap {
  id: string;
  dao_id: string;
}

// Frontend-specific types
export interface CreateDAOParams {
  name: string;
  description: string;
  proposal_threshold: number;
  voting_quorum: number;
  voting_threshold: number;
  voting_period: number;
  timelock_period: number;
  initial_treasury: number;
}

export interface CreateProposalParams {
  title: string;
  description: string;
  proposal_type: number;
  treasury_transfer_amount?: number;
  treasury_transfer_recipient?: string;
  parameter_key?: string;
  parameter_value?: number;
  validator_address?: string;
}

export interface VoteParams {
  proposal_id: number;
  vote: boolean;
}

export interface StakeParams {
  validator_address: string;
  amount: number;
}

// Events from the contract
export interface DAOCreatedEvent {
  dao_id: string;
  creator: string;
  name: string;
}

export interface ProposalCreatedEvent {
  dao_id: string;
  proposal_id: number;
  proposer: string;
  title: string;
  voting_ends_at: number;
}

export interface VoteCastEvent {
  dao_id: string;
  proposal_id: number;
  voter: string;
  vote: boolean;
  voting_power: number;
}

export interface ProposalExecutedEvent {
  dao_id: string;
  proposal_id: number;
  executed_by: string;
}

export interface TreasuryFundedEvent {
  dao_id: string;
  funder: string;
  amount: number;
}

export interface StakeCreatedEvent {
  dao_id: string;
  staker: string;
  validator: string;
  amount: number;
}

export interface RewardsClaimedEvent {
  dao_id: string;
  staker: string;
  validator: string;
  amount: number;
} 