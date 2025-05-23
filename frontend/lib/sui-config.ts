export const SUI_CONFIG = {
  PACKAGE_ID: '0x29a6132ed3245db42adac3bbb86fe38ed7d4677585546aaa9a70294f3e1fa05b',
  NETWORK: 'testnet', // Change to 'mainnet' for production
  RPC_URL: 'https://fullnode.testnet.sui.io:443',
};

export const DAO_GOVERNANCE_MODULE = `${SUI_CONFIG.PACKAGE_ID}::dao_governance`;

// Function names from the contract
export const FUNCTIONS = {
  CREATE_DAO: 'create_dao',
  FUND_TREASURY: 'fund_treasury',
  REGISTER_MEMBER: 'register_member',
  CREATE_PROPOSAL: 'create_proposal',
  VOTE_ON_PROPOSAL: 'vote_on_proposal',
  PROCESS_PROPOSAL: 'process_proposal',
  EXECUTE_PROPOSAL: 'execute_proposal',
  STAKE_ON_VALIDATOR: 'stake_on_validator',
  CLAIM_REWARDS: 'claim_rewards',
};

// Object types from the contract
export const OBJECT_TYPES = {
  DAO: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::DAO`,
  ADMIN_CAP: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::AdminCap`,
  STAKE: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::Stake`,
};

// Event types from the contract
export const EVENT_TYPES = {
  DAO_CREATED: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::DAOCreated`,
  PROPOSAL_CREATED: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::ProposalCreated`,
  VOTE_CAST: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::VoteCast`,
  PROPOSAL_EXECUTED: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::ProposalExecuted`,
  TREASURY_FUNDED: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::TreasuryFunded`,
  STAKE_CREATED: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::StakeCreated`,
  REWARDS_CLAIMED: `${SUI_CONFIG.PACKAGE_ID}::dao_governance::RewardsClaimed`,
};

// Error codes from the contract
export const ERROR_CODES = {
  NOT_AUTHORIZED: 0,
  INVALID_THRESHOLD: 1,
  INVALID_QUORUM: 2,
  INSUFFICIENT_TOKENS: 3,
  PROPOSAL_NOT_ACTIVE: 4,
  ALREADY_VOTED: 5,
  PROPOSAL_NOT_ENDED: 6,
  PROPOSAL_EXPIRED: 7,
  INVALID_PROPOSAL: 8,
  INVALID_STAKE: 9,
  INVALID_VALIDATOR: 10,
};

// Proposal status codes
export const PROPOSAL_STATUS = {
  ACTIVE: 0,
  PASSED: 1,
  FAILED: 2,
  EXECUTED: 3,
  CANCELED: 4,
};

// Proposal type codes
export const PROPOSAL_TYPE = {
  TREASURY: 0,
  PARAMETER_CHANGE: 1,
  VALIDATOR: 2,
  CUSTOM: 3,
}; 