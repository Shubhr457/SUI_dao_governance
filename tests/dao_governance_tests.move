#[test_only]
module dao_governance::dao_governance_tests {
    use dao_governance::dao_governance::{Self, DAO, AdminCap};
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use std::string;

    // Test addresses
    const ADMIN: address = @0xA;
    const MEMBER1: address = @0xB;
    const MEMBER2: address = @0xC;
    const MEMBER3: address = @0xD;
    const VALIDATOR: address = @0xE;

    // Test constants
    const DAO_NAME: vector<u8> = b"Test DAO";
    const DAO_DESCRIPTION: vector<u8> = b"A DAO for testing";
    const PROPOSAL_THRESHOLD: u64 = 10;
    const VOTING_QUORUM: u64 = 50;
    const VOTING_THRESHOLD: u64 = 60;
    const VOTING_PERIOD: u64 = 86400000; // 1 day in ms
    const TIMELOCK_PERIOD: u64 = 43200000; // 12 hours in ms
    const INITIAL_TREASURY: u64 = 1000000000; // 1 SUI

    fun setup(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        
        // Create clock and transfer it to be shared
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock);
        };
        
        // Create DAO with initial treasury
        ts::next_tx(&mut scenario, ADMIN);
        {
            let coin = coin::mint_for_testing<SUI>(INITIAL_TREASURY, ts::ctx(&mut scenario));
            dao_governance::create_dao(
                DAO_NAME,
                DAO_DESCRIPTION,
                PROPOSAL_THRESHOLD,
                VOTING_QUORUM,
                VOTING_THRESHOLD,
                VOTING_PERIOD,
                TIMELOCK_PERIOD,
                coin,
                ts::ctx(&mut scenario)
            );
        };

        scenario
    }

    #[test]
    fun test_dao_creation() {
        let mut scenario = setup();
        
        // Verify DAO was created with correct parameters
        ts::next_tx(&mut scenario, ADMIN);
        {
            let dao = ts::take_shared<DAO>(&scenario);
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            
            assert!(dao_governance::get_name(&dao) == string::utf8(DAO_NAME), 0);
            assert!(dao_governance::get_proposal_threshold(&dao) == PROPOSAL_THRESHOLD, 0);
            assert!(dao_governance::get_voting_quorum(&dao) == VOTING_QUORUM, 0);
            assert!(dao_governance::get_voting_threshold(&dao) == VOTING_THRESHOLD, 0);
            assert!(dao_governance::get_treasury_balance(&dao) == INITIAL_TREASURY, 0);
            
            ts::return_shared(dao);
            ts::return_to_address(ADMIN, admin_cap);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_member_registration() {
        let mut scenario = setup();
        
        // Register member1
        ts::next_tx(&mut scenario, MEMBER1);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            dao_governance::register_member(&mut dao, 100, ts::ctx(&mut scenario));
            assert!(dao_governance::get_member_voting_power(&dao, MEMBER1) == 100, 0);
            ts::return_shared(dao);
        };
        
        // Register member2
        ts::next_tx(&mut scenario, MEMBER2);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            dao_governance::register_member(&mut dao, 200, ts::ctx(&mut scenario));
            assert!(dao_governance::get_member_voting_power(&dao, MEMBER2) == 200, 0);
            ts::return_shared(dao);
        };
        
        // Verify member count
        ts::next_tx(&mut scenario, ADMIN);
        {
            let dao = ts::take_shared<DAO>(&scenario);
            assert!(dao_governance::get_member_count(&dao) == 2, 0);
            ts::return_shared(dao);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_proposal_creation_and_voting() {
        let mut scenario = setup();
        
        // Register members
        ts::next_tx(&mut scenario, MEMBER1);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            dao_governance::register_member(&mut dao, 100, ts::ctx(&mut scenario));
            ts::return_shared(dao);
        };
        
        ts::next_tx(&mut scenario, MEMBER2);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            dao_governance::register_member(&mut dao, 200, ts::ctx(&mut scenario));
            ts::return_shared(dao);
        };
        
        // Create proposal
        ts::next_tx(&mut scenario, MEMBER1);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            dao_governance::create_proposal(
                &mut dao,
                b"Test Proposal",
                b"This is a test proposal",
                0, // Treasury proposal
                100000000, // 0.1 SUI
                MEMBER3,
                b"", // No parameter change
                0,
                @0x0, // No validator
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        // Vote on proposal
        ts::next_tx(&mut scenario, MEMBER2);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            dao_governance::vote_on_proposal(
                &mut dao,
                0, // First proposal
                true, // Yes vote
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        // Advance clock past voting period
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut clock = ts::take_shared<Clock>(&scenario);
            clock::increment_for_testing(&mut clock, VOTING_PERIOD + 1);
            ts::return_shared(clock);
        };
        
        // Process proposal
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            dao_governance::process_proposal(
                &mut dao,
                0,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify proposal passed (Member2 has 200 votes out of 300 total, which is 66.6%, above threshold)
            assert!(dao_governance::get_proposal_status(&dao, 0) == 1, 0); // 1 = Passed
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        // Advance clock past timelock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut clock = ts::take_shared<Clock>(&scenario);
            clock::increment_for_testing(&mut clock, TIMELOCK_PERIOD + 1);
            ts::return_shared(clock);
        };
        
        // Execute proposal
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            // Check initial balance
            assert!(dao_governance::get_treasury_balance(&dao) == INITIAL_TREASURY, 0);
            
            dao_governance::execute_proposal(
                &mut dao,
                0,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify proposal executed
            assert!(dao_governance::get_proposal_status(&dao, 0) == 3, 0); // 3 = Executed
            
            // Verify treasury transfer
            assert!(dao_governance::get_treasury_balance(&dao) == INITIAL_TREASURY - 100000000, 0);
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_parameter_change_proposal() {
        let mut scenario = setup();
        
        // Register member
        ts::next_tx(&mut scenario, MEMBER1);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            dao_governance::register_member(&mut dao, 1000, ts::ctx(&mut scenario));
            ts::return_shared(dao);
        };
        
        // Create parameter change proposal
        ts::next_tx(&mut scenario, MEMBER1);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            dao_governance::create_proposal(
                &mut dao,
                b"Change Voting Threshold",
                b"Reduce voting threshold to 51%",
                1, // Parameter change proposal
                0, // No treasury transfer
                @0x0, // No recipient
                b"voting_threshold", // Parameter key
                51, // New value
                @0x0, // No validator
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        // Vote on proposal
        ts::next_tx(&mut scenario, MEMBER1);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            dao_governance::vote_on_proposal(
                &mut dao,
                0,
                true,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        // Advance clock past voting period
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut clock = ts::take_shared<Clock>(&scenario);
            clock::increment_for_testing(&mut clock, VOTING_PERIOD + 1);
            ts::return_shared(clock);
        };
        
        // Process and execute proposal
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let mut clock = ts::take_shared<Clock>(&scenario);
            
            dao_governance::process_proposal(&mut dao, 0, &clock, ts::ctx(&mut scenario));
            clock::increment_for_testing(&mut clock, TIMELOCK_PERIOD + 1);
            dao_governance::execute_proposal(&mut dao, 0, &clock, ts::ctx(&mut scenario));
            
            // Verify parameter was changed
            assert!(dao_governance::get_voting_threshold(&dao) == 51, 0);
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_validator_staking() {
        let mut scenario = setup();
        
        // Create validator proposal
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            // Register admin as member first
            dao_governance::register_member(&mut dao, 1000, ts::ctx(&mut scenario));
            
            dao_governance::create_proposal(
                &mut dao,
                b"Add Validator",
                b"Add a new validator",
                2, // Validator proposal
                0, // No treasury transfer
                @0x0, // No recipient
                b"", // No parameter
                0,
                VALIDATOR, // Validator address
                &clock,
                ts::ctx(&mut scenario)
            );
            
            dao_governance::vote_on_proposal(&mut dao, 0, true, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        // Advance clock and process proposal
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let mut clock = ts::take_shared<Clock>(&scenario);
            
            clock::increment_for_testing(&mut clock, VOTING_PERIOD + 1);
            dao_governance::process_proposal(&mut dao, 0, &clock, ts::ctx(&mut scenario));
            clock::increment_for_testing(&mut clock, TIMELOCK_PERIOD + 1);
            dao_governance::execute_proposal(&mut dao, 0, &clock, ts::ctx(&mut scenario));
            
            // Verify validator was added
            assert!(dao_governance::validator_exists(&dao, VALIDATOR), 0);
            
            ts::return_shared(dao);
            ts::return_shared(clock);
        };
        
        // Stake on validator
        ts::next_tx(&mut scenario, MEMBER1);
        {
            let mut dao = ts::take_shared<DAO>(&scenario);
            let coin = coin::mint_for_testing<SUI>(100000000, ts::ctx(&mut scenario));
            
            dao_governance::stake_on_validator(
                &mut dao,
                VALIDATOR,
                coin,
                ts::ctx(&mut scenario)
            );
            
            // Verify stake was created
            assert!(dao_governance::validator_staked_amount(&dao, VALIDATOR) == 100000000, 0);
            
            ts::return_shared(dao);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 2)]
    fun test_invalid_quorum() {
        let mut scenario = ts::begin(ADMIN);
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let coin = coin::mint_for_testing<SUI>(INITIAL_TREASURY, ts::ctx(&mut scenario));
            dao_governance::create_dao(
                DAO_NAME,
                DAO_DESCRIPTION,
                PROPOSAL_THRESHOLD,
                0, // Invalid quorum (must be > 0)
                VOTING_THRESHOLD,
                VOTING_PERIOD,
                TIMELOCK_PERIOD,
                coin,
                ts::ctx(&mut scenario)
            );
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1)]
    fun test_invalid_threshold() {
        let mut scenario = ts::begin(ADMIN);
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let coin = coin::mint_for_testing<SUI>(INITIAL_TREASURY, ts::ctx(&mut scenario));
            dao_governance::create_dao(
                DAO_NAME,
                DAO_DESCRIPTION,
                PROPOSAL_THRESHOLD,
                VOTING_QUORUM,
                101, // Invalid threshold (must be <= 100)
                VOTING_PERIOD,
                TIMELOCK_PERIOD,
                coin,
                ts::ctx(&mut scenario)
            );
        };
        
        ts::end(scenario);
    }
}