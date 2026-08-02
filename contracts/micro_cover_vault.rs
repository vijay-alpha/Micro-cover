#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec};

pub struct PolicyCover {
    pub policy_id: Symbol,
    pub premium_stroops: i128,
    pub is_active: bool,
}

#[contract]
pub struct MicroCoverVaultContract;

#[contractimpl]
impl MicroCoverVaultContract {
    /// Initialize MicroCover Insurance Pool Vault State
    pub fn initialize(env: Env, admin: Address, pool_treasury: Address) {
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("ADMIN"), &admin);
        env.storage().instance().set(&symbol_short!("TREASURY"), &pool_treasury);
    }

    /// Level 3 Requirement: Inter-Contract Communication
    /// Vault contract communicates with Oracle contract to verify parametric trigger thresholds before claim payout
    pub fn verify_oracle_and_settle_claim(
        env: Env,
        oracle_contract: Address,
        policy_holder: Address,
        claim_amount_stroops: i128,
    ) -> bool {
        policy_holder.require_auth();

        // Cross-contract call to Oracle Contract to verify trigger condition
        let is_oracle_triggered: bool = env.invoke_contract(
            &oracle_contract,
            &Symbol::new(&env, "is_parametric_triggered"),
            Vec::from_array(&env, [policy_holder.to_val()]),
        );

        if is_oracle_triggered {
            // Emit Soroban Contract Event: Claim Settled
            env.events().publish(
                (symbol_short!("CLAIM"), symbol_short!("PAYOUT")),
                (policy_holder, claim_amount_stroops),
            );
            return true;
        }

        false
    }
}
