module dao_governance::dao_governance {
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::vec_map::{Self, VecMap};
    use sui::vec_set::VecSet;
    use sui::transfer::{Self};
    use sui::tx_context::{Self};
    use std::vector::{Self};

    // ====== Errors ======
    const ENotAuthorized: u64 = 0;
    const EInvalidThreshold: u64 = 1;
    const EInvalidQuorum: u64 = 2;
    const EInsufficientTokens: u64 = 3;
    const EProposalNotActive: u64 = 4;
    const EAlreadyVoted: u64 = 5;
    const EProposalNotEnded: u64 = 6;
    const EProposalExpired: u64 = 7;
    const EInvalidProposal: u64 = 8;
    const EInvalidStake: u64 = 9;
    const EInvalidValidator: u64 = 10;

    // ====== Constants ======
    const PROPOSAL_DURATION_DEFAULT: u64 = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // ====== Types ======

    /// Capability for the DAO creator
    public struct AdminCap has key, store {
        id: UID,
        dao_id: ID
    }

    /// Governance token for the DAO
    #[allow(unused_field)]
    public struct GovernanceToken has drop {
        dao_id: ID
    }

    /// The DAO object
    public struct DAO has key {
        id: UID,
        name: String,
        description: String,
        governance_config: GovernanceConfig,
        treasury: Balance<SUI>,
        proposal_count: u64,
        member_count: u64,
        proposals: Table<u64, Proposal>,
        members: Table<address, u64>, // address -> voting power
        member_addresses: VecSet<address>, // Track member addresses for iteration
        validators: VecMap<address, ValidatorInfo>
    }

    /// Governance configuration
    public struct GovernanceConfig has store, copy, drop {
        proposal_threshold: u64,        // minimum tokens required to submit a proposal
        voting_quorum: u64,             // percentage of tokens needed for quorum (1-100)
        voting_threshold: u64,          // percentage of yes votes needed to pass (1-100)
        voting_period: u64,             // duration of voting period in milliseconds
        timelock_period: u64            // delay before execution in milliseconds
    }

    /// Proposal type enum
    public struct ProposalType has store, copy, drop {
        code: u8 // 0 = Treasury, 1 = Parameter Change, 2 = Validator, 3 = Custom
    }

    /// Proposal status enum
    public struct ProposalStatus has store, copy, drop {
        code: u8 // 0 = Active, 1 = Passed, 2 = Failed, 3 = Executed, 4 = Canceled
    }

    /// Proposal object
    public struct Proposal has store {
        id: u64,
        proposer: address,
        title: String,
        description: String,
        proposal_type: ProposalType,
        status: ProposalStatus,
        created_at: u64,
        voting_ends_at: u64,
        execution_time: u64,
        yes_votes: u64,
        no_votes: u64,
        voters: VecSet<address>,
        treasury_transfer_amount: u64,
        treasury_transfer_recipient: address,
        parameter_key: String,
        parameter_value: u64,
        validator_address: address
    }

    /// Validator information
    public struct ValidatorInfo has store, copy, drop {
        address: address,
        name: String,
        performance_score: u64,
        commission_rate: u64, // in basis points (1/100 of a percent)
        staked_amount: u64
    }

    /// Member stake for validators
    public struct Stake has key {
        id: UID,
        dao_id: ID,
        owner: address,
        validator: address,
        amount: u64,
        rewards_claimed: u64
    }

    // ====== Events ======

    public struct DAOCreated has copy, drop {
        dao_id: ID,
        creator: address,
        name: String
    }

    public struct ProposalCreated has copy, drop {
        dao_id: ID,
        proposal_id: u64,
        proposer: address,
        title: String,
        voting_ends_at: u64
    }

    public struct VoteCast has copy, drop {
        dao_id: ID,
        proposal_id: u64,
        voter: address,
        vote: bool, // true = yes, false = no
        voting_power: u64
    }

    public struct ProposalExecuted has copy, drop {
        dao_id: ID,
        proposal_id: u64,
        executed_by: address
    }

    public struct TreasuryFunded has copy, drop {
        dao_id: ID,
        funder: address,
        amount: u64
    }

    public struct StakeCreated has copy, drop {
        dao_id: ID,
        staker: address,
        validator: address,
        amount: u64
    }

    public struct RewardsClaimed has copy, drop {
        dao_id: ID,
        staker: address,
        validator: address,
        amount: u64
    }

    // ====== Core Functions ======

    /// Create a new DAO
    public entry fun create_dao(
        name: vector<u8>,
        description: vector<u8>,
        proposal_threshold: u64,
        voting_quorum: u64,
        voting_threshold: u64,
        voting_period: u64,
        timelock_period: u64,
        initial_treasury: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Validate configuration
        assert!(voting_quorum > 0 && voting_quorum <= 100, EInvalidQuorum);
        assert!(voting_threshold > 0 && voting_threshold <= 100, EInvalidThreshold);
        
        let dao_id = object::new(ctx);
        
        // Create DAO object
        let dao = DAO {
            id: dao_id,
            name: string::utf8(name),
            description: string::utf8(description),
            governance_config: GovernanceConfig {
                proposal_threshold,
                voting_quorum,
                voting_threshold,
                voting_period: if (voting_period == 0) { PROPOSAL_DURATION_DEFAULT } else { voting_period },
                timelock_period
            },
            treasury: coin::into_balance(initial_treasury),
            proposal_count: 0,
            member_count: 0,
            proposals: table::new(ctx),
            members: table::new(ctx),
            member_addresses: sui::vec_set::empty(),
            validators: vec_map::empty()
        };
        
        let dao_id_copy = object::id(&dao);
        
        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
            dao_id: dao_id_copy
        };
        
        // Emit creation event
        event::emit(DAOCreated {
            dao_id: dao_id_copy,
            creator: tx_context::sender(ctx),
            name: string::utf8(name)
        });
        
        // Transfer ownership
        transfer::share_object(dao);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Fund the DAO treasury
    public entry fun fund_treasury(
        dao: &mut DAO, 
        amount: Coin<SUI>, 
        ctx: &mut TxContext
    ) {
        let dao_id = object::id(dao);
        let sender = tx_context::sender(ctx);
        let coin_amount = coin::value(&amount);
        
        // Add funds to treasury
        let balance = coin::into_balance(amount);
        balance::join(&mut dao.treasury, balance);
        
        // Emit funding event
        event::emit(TreasuryFunded {
            dao_id,
            funder: sender,
            amount: coin_amount
        });
    }

    /// Register as a DAO member by staking tokens
    public entry fun register_member(
        dao: &mut DAO,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        if (table::contains(&dao.members, sender)) {
            let current_power = *table::borrow(&dao.members, sender);
            table::remove(&mut dao.members, sender);
            table::add(&mut dao.members, sender, current_power + amount);
        } else {
            table::add(&mut dao.members, sender, amount);
            sui::vec_set::insert(&mut dao.member_addresses, sender);
            dao.member_count = dao.member_count + 1;
        }
    }

    /// Create a new proposal
    public entry fun create_proposal(
        dao: &mut DAO,
        title: vector<u8>,
        description: vector<u8>,
        proposal_type: u8,
        treasury_transfer_amount: u64,
        treasury_transfer_recipient: address,
        parameter_key: vector<u8>,
        parameter_value: u64,
        validator_address: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if member has enough tokens to create proposal
        assert!(table::contains(&dao.members, sender), ENotAuthorized);
        let voting_power = *table::borrow(&dao.members, sender);
        assert!(voting_power >= dao.governance_config.proposal_threshold, EInsufficientTokens);
        
        // Create proposal
        let proposal_id = dao.proposal_count;
        dao.proposal_count = dao.proposal_count + 1;
        
        let current_time = clock::timestamp_ms(clock);
        let voting_ends_at = current_time + dao.governance_config.voting_period;
        
        let proposal = Proposal {
            id: proposal_id,
            proposer: sender,
            title: string::utf8(title),
            description: string::utf8(description),
            proposal_type: ProposalType { code: proposal_type },
            status: ProposalStatus { code: 0 }, // Active
            created_at: current_time,
            voting_ends_at,
            execution_time: voting_ends_at + dao.governance_config.timelock_period,
            yes_votes: 0,
            no_votes: 0,
            voters: sui::vec_set::empty(),
            treasury_transfer_amount,
            treasury_transfer_recipient,
            parameter_key: string::utf8(parameter_key),
            parameter_value,
            validator_address
        };
        
        table::add(&mut dao.proposals, proposal_id, proposal);
        
        // Emit proposal creation event
        event::emit(ProposalCreated {
            dao_id: object::id(dao),
            proposal_id,
            proposer: sender,
            title: string::utf8(title),
            voting_ends_at
        });
    }

    /// Vote on a proposal
    public entry fun vote_on_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        vote: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if member has voting power
        assert!(table::contains(&dao.members, sender), ENotAuthorized);
        let voting_power = *table::borrow(&dao.members, sender);
        
        // Check if proposal exists and is active
        assert!(table::contains(&dao.proposals, proposal_id), EInvalidProposal);
        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        assert!(proposal.status.code == 0, EProposalNotActive); // Must be active
        
        // Check if voting period is still open
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < proposal.voting_ends_at, EProposalExpired);
        
        // Check if user already voted
        assert!(!sui::vec_set::contains(&proposal.voters, &sender), EAlreadyVoted);
        
        // Record vote
        if (vote) {
            proposal.yes_votes = proposal.yes_votes + voting_power;
        } else {
            proposal.no_votes = proposal.no_votes + voting_power;
        };
        
        // Fix: Use the fully qualified module path
        sui::vec_set::insert(&mut proposal.voters, sender);
        
        // Emit vote event
        event::emit(VoteCast {
            dao_id: object::id(dao),
            proposal_id,
            voter: sender,
            vote,
            voting_power
        });
    }

    /// Process proposal result after voting period ends
    public entry fun process_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        // Check if proposal exists
        assert!(table::contains(&dao.proposals, proposal_id), EInvalidProposal);
        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        
        // Check if proposal is still active
        assert!(proposal.status.code == 0, EProposalNotActive);
        
        // Check if voting period ended
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= proposal.voting_ends_at, EProposalNotEnded);
        
        // Calculate total votes
        let total_votes = proposal.yes_votes + proposal.no_votes;
        let mut total_voting_power = 0u64;
        
        // Fix: Create a copy of the addresses vector to iterate over
        let addresses = *sui::vec_set::keys(&dao.member_addresses);
        let mut i = 0;
        let len = vector::length(&addresses);
        while (i < len) {
            let addr = *vector::borrow(&addresses, i);
            let power = *table::borrow(&dao.members, addr);
            total_voting_power = total_voting_power + power;
            i = i + 1;
        };
        
        // Check quorum
        let quorum_reached = (total_votes * 100) >= (total_voting_power * dao.governance_config.voting_quorum);
        
        // Check voting threshold
        let threshold_reached = quorum_reached && 
            ((proposal.yes_votes * 100) >= (total_votes * dao.governance_config.voting_threshold));
        
        // Update proposal status
        if (threshold_reached) {
            proposal.status = ProposalStatus { code: 1 }; // Passed
        } else {
            proposal.status = ProposalStatus { code: 2 }; // Failed
        };
    }

    /// Execute a passed proposal
    public entry fun execute_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if proposal exists and has passed
        assert!(table::contains(&dao.proposals, proposal_id), EInvalidProposal);
        
        // Get the proposal type and status before mutably borrowing dao
        let (is_passed, proposal_type, execution_time) = {
            let proposal = table::borrow(&dao.proposals, proposal_id);
            (
                proposal.status.code == 1, 
                proposal.proposal_type.code,
                proposal.execution_time
            )
        };
        
        // Verify proposal has passed
        assert!(is_passed, EProposalNotActive);
        
        // Check if timelock period has passed
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= execution_time, EProposalNotEnded);
        
        // Execute based on proposal type
        if (proposal_type == 0) {
            // Treasury transfer
            execute_treasury_proposal(dao, proposal_id, ctx);
        } else if (proposal_type == 1) {
            // Parameter change
            execute_parameter_proposal(dao, proposal_id);
        } else if (proposal_type == 2) {
            // Validator proposal
            execute_validator_proposal(dao, proposal_id);
        };
        
        // Update proposal status after execution
        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        proposal.status = ProposalStatus { code: 3 }; // Executed
        
        // Emit execution event
        event::emit(ProposalExecuted {
            dao_id: object::id(dao),
            proposal_id,
            executed_by: sender
        });
    }

    // ====== Helper Functions ======

    /// Execute treasury transfer proposal
    fun execute_treasury_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        let proposal = table::borrow(&dao.proposals, proposal_id);
        let amount = proposal.treasury_transfer_amount;
        let recipient = proposal.treasury_transfer_recipient;
        
        // Check if treasury has enough funds
        assert!(balance::value(&dao.treasury) >= amount, EInsufficientTokens);
        
        // Transfer funds
        let coin = coin::take(&mut dao.treasury, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Execute parameter change proposal
    fun execute_parameter_proposal(dao: &mut DAO, proposal_id: u64) {
        let proposal = table::borrow(&dao.proposals, proposal_id);
        let param_key = &proposal.parameter_key;
        let param_value = proposal.parameter_value;
        
        // Update parameter based on key
        if (string::utf8(b"proposal_threshold") == *param_key) {
            dao.governance_config.proposal_threshold = param_value;
        } else if (string::utf8(b"voting_quorum") == *param_key) {
            assert!(param_value > 0 && param_value <= 100, EInvalidQuorum);
            dao.governance_config.voting_quorum = param_value;
        } else if (string::utf8(b"voting_threshold") == *param_key) {
            assert!(param_value > 0 && param_value <= 100, EInvalidThreshold);
            dao.governance_config.voting_threshold = param_value;
        } else if (string::utf8(b"voting_period") == *param_key) {
            dao.governance_config.voting_period = param_value;
        } else if (string::utf8(b"timelock_period") == *param_key) {
            dao.governance_config.timelock_period = param_value;
        };
    }

    /// Execute validator proposal
    fun execute_validator_proposal(dao: &mut DAO, proposal_id: u64) {
        let proposal = table::borrow(&dao.proposals, proposal_id);
        let validator_addr = proposal.validator_address;
        
        // Check if this validator exists (add or update)
        if (vec_map::contains(&dao.validators, &validator_addr)) {
            // Update validator if it exists (nothing to do here in this implementation)
        } else {
            // Add new validator
            let validator_info = ValidatorInfo {
                address: validator_addr,
                name: string::utf8(b""), // Name could be set in a separate call
                performance_score: 0,
                commission_rate: 500, // 5% default
                staked_amount: 0
            };
            vec_map::insert(&mut dao.validators, validator_addr, validator_info);
        }
    }

    /// Stake SUI on a validator
    public entry fun stake_on_validator(
        dao: &mut DAO,
        validator_address: address,
        amount: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let dao_id = object::id(dao);
        let coin_amount = coin::value(&amount);
        
        // Verify the validator exists
        assert!(vec_map::contains(&dao.validators, &validator_address), EInvalidValidator);
        
        // Add stake to validator
        let validator = vec_map::get_mut(&mut dao.validators, &validator_address);
        validator.staked_amount = validator.staked_amount + coin_amount;
        
        // Add funds to treasury
        let balance = coin::into_balance(amount);
        balance::join(&mut dao.treasury, balance);
        
        // Create stake object
        let stake = Stake {
            id: object::new(ctx),
            dao_id,
            owner: sender,
            validator: validator_address,
            amount: coin_amount,
            rewards_claimed: 0
        };
        
        // Emit stake event
        event::emit(StakeCreated {
            dao_id,
            staker: sender,
            validator: validator_address,
            amount: coin_amount
        });
        
        // Transfer stake to user
        transfer::transfer(stake, sender);
    }

    /// Claim staking rewards
    public entry fun claim_rewards(
        dao: &mut DAO,
        stake: &mut Stake,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify stake owner
        assert!(stake.owner == sender, ENotAuthorized);
        assert!(stake.dao_id == object::id(dao), EInvalidStake);
        
        // Calculate rewards (simplified version)
        let _validator = vec_map::get(&dao.validators, &stake.validator);
        let reward_rate = 5; // 5% annual reward rate for example
        let reward_amount = (stake.amount * reward_rate) / 100;
        
        // Check if treasury has enough funds for rewards
        assert!(balance::value(&dao.treasury) >= reward_amount, EInsufficientTokens);
        
        // Transfer rewards
        let reward_coin = coin::take(&mut dao.treasury, reward_amount, ctx);
        transfer::public_transfer(reward_coin, sender);
        
        // Update stake record
        stake.rewards_claimed = stake.rewards_claimed + reward_amount;
        
        // Emit reward claim event
        event::emit(RewardsClaimed {
            dao_id: object::id(dao),
            staker: sender,
            validator: stake.validator,
            amount: reward_amount
        });
    }

    // ====== Getter Functions ======
    
    /// Get the DAO name
    public fun get_name(dao: &DAO): String {
        dao.name
    }
    
    /// Get the DAO proposal threshold
    public fun get_proposal_threshold(dao: &DAO): u64 {
        dao.governance_config.proposal_threshold
    }
    
    /// Get the DAO voting quorum
    public fun get_voting_quorum(dao: &DAO): u64 {
        dao.governance_config.voting_quorum
    }
    
    /// Get the DAO voting threshold
    public fun get_voting_threshold(dao: &DAO): u64 {
        dao.governance_config.voting_threshold
    }
    
    /// Get the treasury balance
    public fun get_treasury_balance(dao: &DAO): u64 {
        balance::value(&dao.treasury)
    }
    
    /// Get member voting power
    public fun get_member_voting_power(dao: &DAO, member: address): u64 {
        if (table::contains(&dao.members, member)) {
            *table::borrow(&dao.members, member)
        } else {
            0
        }
    }
    
    /// Get member count
    public fun get_member_count(dao: &DAO): u64 {
        dao.member_count
    }
    
    /// Get proposal status
    public fun get_proposal_status(dao: &DAO, proposal_id: u64): u8 {
        let proposal = table::borrow(&dao.proposals, proposal_id);
        proposal.status.code
    }
    
    /// Check if validator exists
    public fun validator_exists(dao: &DAO, validator: address): bool {
        vec_map::contains(&dao.validators, &validator)
    }
    
    /// Get validator staked amount
    public fun validator_staked_amount(dao: &DAO, validator: address): u64 {
        let validator_info = vec_map::get(&dao.validators, &validator);
        validator_info.staked_amount
    }
}