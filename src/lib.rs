#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    token, Address, Bytes, Env, Symbol,
};

// ---------------------------------------------------------------------------
// Storage key types
// ---------------------------------------------------------------------------

/// Key used to look up a registered ticket in persistent storage.
/// Keyed by the ticket's on-chain hash (Bytes).
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Ticket(Bytes),   // ticket_hash → TicketRecord
    Used(Bytes),     // ticket_hash → bool  (scan-use flag)
}

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------

/// Represents a registered ticket stored on-chain.
#[contracttype]
#[derive(Clone)]
pub struct TicketRecord {
    /// SHA-256 (or any 32-byte) hash of ticket metadata supplied by the organizer.
    pub ticket_hash: Bytes,
    /// Stellar wallet address that legitimately owns this ticket.
    pub owner: Address,
    /// Keccak / SHA-256 hash of the originating event — used for tamper detection.
    pub event_hash: Bytes,
    /// XLM amount (in stroops) paid for the ticket; stored for payout reference.
    pub price_stroops: i128,
}

// ---------------------------------------------------------------------------
// Error codes emitted by the contract
// ---------------------------------------------------------------------------

#[contracterror]
#[derive(Clone, Copy, PartialEq, Debug)]
#[repr(u32)]
pub enum TicketError {
    AlreadyRegistered = 1, // duplicate issuance attempt
    NotFound          = 2, // ticket does not exist
    AlreadyUsed       = 3, // duplicate scan / re-entry attempt
    TamperedHash      = 4, // event_hash mismatch detected at scan time
    Unauthorized      = 5, // caller is not the ticket owner or organizer
}

// ---------------------------------------------------------------------------
// Contract entry-point
// ---------------------------------------------------------------------------

#[contract]
pub struct StellarPassContract;

#[contractimpl]
impl StellarPassContract {

    // -----------------------------------------------------------------------
    // register_ticket()
    //
    // Called by an event organizer (or the ticketing platform) to mint a new
    // on-chain ticket.  Checks for:
    //   • duplicate issuance  — same ticket_hash already exists → error
    //   • tamper detection    — event_hash must be non-empty/non-zero
    //
    // On success the TicketRecord is written to persistent storage and a
    // `ticket_registered` event is emitted so off-chain indexers can track it.
    // -----------------------------------------------------------------------
    pub fn register_ticket(
        env: Env,
        ticket_hash: Bytes,
        owner: Address,
        event_hash: Bytes,
        price_stroops: i128,
    ) -> Result<(), TicketError> {
        // Require the organizer/owner to have authorised this call.
        owner.require_auth();

        // --- Duplicate detection -------------------------------------------
        // If a record with this hash already exists, reject immediately.
        if env
            .storage()
            .persistent()
            .has(&DataKey::Ticket(ticket_hash.clone()))
        {
            return Err(TicketError::AlreadyRegistered);
        }

        // --- Tamper / integrity check --------------------------------------
        // A zero-length event_hash means the caller supplied no event context;
        // treat this as a tampered / invalid ticket attempt.
        if event_hash.len() == 0 {
            return Err(TicketError::TamperedHash);
        }

        // --- Persist the ticket record ------------------------------------
        let record = TicketRecord {
            ticket_hash: ticket_hash.clone(),
            owner: owner.clone(),
            event_hash,
            price_stroops,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Ticket(ticket_hash.clone()), &record);

        // Mark ticket as NOT yet used.
        env.storage()
            .persistent()
            .set(&DataKey::Used(ticket_hash.clone()), &false);

        // Emit on-chain event so indexers / front-ends can react.
        env.events().publish(
            (Symbol::new(&env, "ticket_registered"), owner),
            ticket_hash,
        );

        Ok(())
    }

    // -----------------------------------------------------------------------
    // verify_ticket()
    //
    // Called by a venue scanner at the gate.  This function:
    //   1. Checks the ticket exists (NotFound → deny entry).
    //   2. Checks the ticket has NOT already been scanned (AlreadyUsed → deny).
    //   3. Validates the supplied event_hash matches the stored one (tamper check).
    //   4. Marks the ticket as used so it cannot be scanned again.
    //   5. Emits a `ticket_verified` event with the owner address.
    //
    // Returns true on a clean first-time scan; errors encode the denial reason.
    // -----------------------------------------------------------------------
    pub fn verify_ticket(
        env: Env,
        ticket_hash: Bytes,
        event_hash: Bytes,
    ) -> Result<bool, TicketError> {
        // --- Existence check -----------------------------------------------
        let record: TicketRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Ticket(ticket_hash.clone()))
            .ok_or(TicketError::NotFound)?;

        // --- Duplicate-scan (re-entry) check --------------------------------
        let already_used: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Used(ticket_hash.clone()))
            .unwrap_or(false);

        if already_used {
            return Err(TicketError::AlreadyUsed);
        }

        // --- Tamper detection -----------------------------------------------
        // The scanner supplies the expected event_hash; if it differs from
        // what was stored at registration, the ticket has been tampered with.
        if record.event_hash != event_hash {
            return Err(TicketError::TamperedHash);
        }

        // --- Mark as used (one-time entry) ----------------------------------
        env.storage()
            .persistent()
            .set(&DataKey::Used(ticket_hash.clone()), &true);

        // Emit verification event — useful for audit logs and analytics.
        env.events().publish(
            (Symbol::new(&env, "ticket_verified"), record.owner.clone()),
            ticket_hash,
        );

        Ok(true)
    }

    // -----------------------------------------------------------------------
    // payout_organizer()
    //
    // Sends XLM (in stroops) from the caller's account to the organizer's
    // wallet address as a ticket-sale settlement.  This is the financial-
    // access layer of StellarPass: revenue flows directly on-chain, no
    // intermediary bank or payment processor needed.
    //
    // The XLM token contract address on Testnet is supplied by the caller so
    // the contract stays network-agnostic.
    //
    // Caller must authorise the transfer (require_auth on `from`).
    // -----------------------------------------------------------------------
    pub fn payout_organizer(
        env: Env,
        xlm_token: Address,  // address of the native XLM token contract
        from: Address,       // payer (ticket buyer or platform escrow)
        organizer: Address,  // recipient (event organizer wallet)
        amount_stroops: i128,
    ) -> Result<(), TicketError> {
        // Require the payer to authorise the spend.
        from.require_auth();

        // Use Soroban's token interface to execute the XLM transfer.
        let token_client = token::Client::new(&env, &xlm_token);
        token_client.transfer(&from, &organizer, &amount_stroops);

        // Emit payout event for transparency / off-chain reconciliation.
        env.events().publish(
            (Symbol::new(&env, "organizer_paid"), organizer),
            amount_stroops,
        );

        Ok(())
    }

    // -----------------------------------------------------------------------
    // get_ticket()
    //
    // Read-only helper — returns the full TicketRecord for a given hash.
    // Useful for front-end dashboards and venue management tools.
    // -----------------------------------------------------------------------
    pub fn get_ticket(env: Env, ticket_hash: Bytes) -> Result<TicketRecord, TicketError> {
        env.storage()
            .persistent()
            .get(&DataKey::Ticket(ticket_hash))
            .ok_or(TicketError::NotFound)
    }

    // -----------------------------------------------------------------------
    // is_used()
    //
    // Returns true if the ticket has already been scanned / used.
    // Lightweight check for gate scanners before committing a full verify.
    // -----------------------------------------------------------------------
    pub fn is_used(env: Env, ticket_hash: Bytes) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Used(ticket_hash))
            .unwrap_or(false)
    }
}
