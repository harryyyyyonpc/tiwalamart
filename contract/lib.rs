#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    token, Address, Env, Symbol,
};

// ─────────────────────────────────────────────
//  Storage Key Enum
//  Each variant is a distinct on-chain storage slot.
// ─────────────────────────────────────────────
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Stores EscrowState keyed by a u64 transaction ID.
    Escrow(u64),
    /// Auto-incrementing counter used to assign unique transaction IDs.
    TxCounter,
}

// ─────────────────────────────────────────────
//  Escrow Status
//  Tracks the lifecycle of every escrow transaction.
// ─────────────────────────────────────────────
#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum EscrowStatus {
    /// Funds are locked in the contract; awaiting buyer confirmation.
    Locked,
    /// Buyer confirmed delivery; funds released to the seller.
    Released,
    /// Buyer raised a dispute or seller failed to deliver; funds refunded.
    Refunded,
}

// ─────────────────────────────────────────────
//  EscrowState
//  The full state of one escrow transaction, stored on-chain.
// ─────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug)]
pub struct EscrowState {
    /// Wallet address of the buyer who deposited the funds.
    pub buyer: Address,
    /// Wallet address of the seller / service provider.
    pub seller: Address,
    /// Token contract address (XLM or custom platform token).
    pub token: Address,
    /// Amount locked in this escrow (in token stroops).
    pub amount: i128,
    /// Current lifecycle status of this escrow.
    pub status: EscrowStatus,
}

// ─────────────────────────────────────────────
//  Error Codes
//  Named integer constants returned on failure.
//  Soroban uses panic! with u32 codes for contract errors.
// ─────────────────────────────────────────────
pub const ERR_NOT_FOUND: u32 = 1;       // Escrow ID does not exist
pub const ERR_WRONG_STATUS: u32 = 2;    // Operation not valid for current status
pub const ERR_UNAUTHORIZED: u32 = 3;    // Caller is not the expected party

// ─────────────────────────────────────────────
//  Event topic symbols  (max 9 UTF-8 bytes each)
// ─────────────────────────────────────────────
const TOPIC_LOCKED: Symbol   = symbol_short!("locked");
const TOPIC_RELEASED: Symbol = symbol_short!("released");
const TOPIC_REFUNDED: Symbol = symbol_short!("refunded");

// ─────────────────────────────────────────────
//  Contract Entry Point
// ─────────────────────────────────────────────
#[contract]
pub struct TiwalaMartContract;

#[contractimpl]
impl TiwalaMartContract {

    // ─────────────────────────────────────────
    //  create_escrow
    //
    //  Called by the BUYER to lock funds into the contract.
    //
    //  Steps:
    //  1. Require the buyer to authorise the call (prevents spoofing).
    //  2. Transfer `amount` tokens from buyer → contract via the token client.
    //  3. Persist the EscrowState on-chain with status = Locked.
    //  4. Emit a "locked" event so off-chain UIs can react in real time.
    //  5. Return the new transaction ID so the buyer can share it with the seller.
    // ─────────────────────────────────────────
    pub fn create_escrow(
        env: Env,
        buyer: Address,
        seller: Address,
        token: Address,
        amount: i128,
    ) -> u64 {
        // Step 1 – the buyer must sign this transaction.
        buyer.require_auth();

        // Step 2 – pull funds from buyer into this contract.
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        // Step 3 – assign a unique ID and persist state.
        let tx_id = Self::next_tx_id(&env);
        let state = EscrowState {
            buyer: buyer.clone(),
            seller: seller.clone(),
            token,
            amount,
            status: EscrowStatus::Locked,
        };
        env.storage().instance().set(&DataKey::Escrow(tx_id), &state);

        // Step 4 – emit on-chain event: ("locked", tx_id, buyer, seller, amount)
        env.events().publish(
            (TOPIC_LOCKED, tx_id),
            (buyer, seller, amount),
        );

        // Step 5 – return the transaction ID.
        tx_id
    }

    // ─────────────────────────────────────────
    //  confirm_delivery
    //
    //  Called by the BUYER after receiving goods or confirming service completion.
    //
    //  Steps:
    //  1. Load and validate the escrow record.
    //  2. Require the buyer to authorise (only the original buyer can confirm).
    //  3. Ensure status is still Locked (idempotency guard).
    //  4. Transfer funds from contract → seller.
    //  5. Update status to Released and save.
    //  6. Emit a "released" event.
    // ─────────────────────────────────────────
    pub fn confirm_delivery(env: Env, tx_id: u64, buyer: Address) {
        // Step 1 – load escrow; panic if not found.
        let mut state: EscrowState = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(tx_id))
            .unwrap_or_else(|| panic!("{}", ERR_NOT_FOUND));

        // Step 2 – only the original buyer may confirm delivery.
        if state.buyer != buyer {
            panic!("{}", ERR_UNAUTHORIZED);
        }
        buyer.require_auth();

        // Step 3 – funds must still be locked.
        if state.status != EscrowStatus::Locked {
            panic!("{}", ERR_WRONG_STATUS);
        }

        // Step 4 – release funds to the seller.
        let token_client = token::Client::new(&env, &state.token);
        token_client.transfer(
            &env.current_contract_address(),
            &state.seller,
            &state.amount,
        );

        // Step 5 – update state.
        state.status = EscrowStatus::Released;
        env.storage().instance().set(&DataKey::Escrow(tx_id), &state);

        // Step 6 – emit event: ("released", tx_id, seller, amount)
        env.events().publish(
            (TOPIC_RELEASED, tx_id),
            (state.seller, state.amount),
        );
    }

    // ─────────────────────────────────────────
    //  refund_buyer
    //
    //  Called by the SELLER voluntarily, or by the BUYER on expiry / dispute.
    //  For MVP, either party may trigger a refund while status is Locked.
    //
    //  Steps:
    //  1. Load and validate the escrow.
    //  2. Require the caller to be either the buyer or seller.
    //  3. Guard against double-refund (status must be Locked).
    //  4. Return funds to the original buyer.
    //  5. Update status to Refunded.
    //  6. Emit a "refunded" event.
    // ─────────────────────────────────────────
    pub fn refund_buyer(env: Env, tx_id: u64, caller: Address) {
        // Step 1 – load escrow.
        let mut state: EscrowState = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(tx_id))
            .unwrap_or_else(|| panic!("{}", ERR_NOT_FOUND));

        // Step 2 – only the buyer or seller may initiate a refund.
        let is_buyer  = state.buyer  == caller;
        let is_seller = state.seller == caller;
        if !is_buyer && !is_seller {
            panic!("{}", ERR_UNAUTHORIZED);
        }
        caller.require_auth();

        // Step 3 – can only refund while funds are still locked.
        if state.status != EscrowStatus::Locked {
            panic!("{}", ERR_WRONG_STATUS);
        }

        // Step 4 – return funds to the buyer.
        let token_client = token::Client::new(&env, &state.token);
        token_client.transfer(
            &env.current_contract_address(),
            &state.buyer,
            &state.amount,
        );

        // Step 5 – update state.
        state.status = EscrowStatus::Refunded;
        env.storage().instance().set(&DataKey::Escrow(tx_id), &state);

        // Step 6 – emit event: ("refunded", tx_id, buyer, amount)
        env.events().publish(
            (TOPIC_REFUNDED, tx_id),
            (state.buyer, state.amount),
        );
    }

    // ─────────────────────────────────────────
    //  get_escrow
    //
    //  Read-only view — returns the full EscrowState for a given tx_id.
    //  Useful for the frontend to display payment status to both parties.
    // ─────────────────────────────────────────
    pub fn get_escrow(env: Env, tx_id: u64) -> EscrowState {
        env.storage()
            .instance()
            .get(&DataKey::Escrow(tx_id))
            .unwrap_or_else(|| panic!("{}", ERR_NOT_FOUND))
    }

    // ─────────────────────────────────────────
    //  get_status
    //
    //  Lightweight read — returns only the EscrowStatus for a given tx_id.
    //  Off-chain event listeners can cross-check this against emitted events.
    // ─────────────────────────────────────────
    pub fn get_status(env: Env, tx_id: u64) -> EscrowStatus {
        let state: EscrowState = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(tx_id))
            .unwrap_or_else(|| panic!("{}", ERR_NOT_FOUND));
        state.status
    }

    // ─────────────────────────────────────────
    //  next_tx_id  (private helper)
    //
    //  Reads the current counter, increments it atomically, and returns the
    //  previous value as the ID for the new escrow record.
    //  Starting at 1 keeps IDs human-readable.
    // ─────────────────────────────────────────
    fn next_tx_id(env: &Env) -> u64 {
        let current: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TxCounter)
            .unwrap_or(0u64);
        let next = current + 1;
        env.storage().instance().set(&DataKey::TxCounter, &next);
        next
    }
}
