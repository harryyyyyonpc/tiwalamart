# StellarPass

> **On-chain event ticket verification — anti-fraud, secure entry, and direct XLM payouts on Stellar Soroban. (This is a placeholder project here -- will update this soon**

---

## Problem

Concert-goers and event attendees across the Philippines and Southeast Asia routinely face fake tickets, duplicated QR codes, scalping, and invalid resold passes. Existing ticketing systems rely on centralised databases and static QR images that can be screenshotted, copied, or resold multiple times. The result:

- Denied entry at venue gates
- Fraud and scams targeting buyers
- Revenue loss for organisers and performers
- Slow, error-prone manual verification

## Solution

StellarPass builds a transparent, on-chain ticket verification system on **Stellar Soroban**. Every ticket has a unique, traceable identity securely linked to its rightful owner's wallet. Upon scanning:

1. The system instantly **verifies ticket authenticity** against the on-chain record.
2. **Duplicate scan prevention** blocks re-entry with the same pass.
3. **Tamper detection** rejects any ticket whose event hash has been altered.
4. **XLM payouts** flow directly to organisers and performers — no intermediary needed.

---

## Stellar Features Used

| Feature | How StellarPass Uses It |
|---|---|
| **Soroban Smart Contract** | Core ticket registry, tamper detection, duplicate-scan prevention, verification logic, and payout triggers |
| **XLM Transfers** | Ticket purchase settlement and direct organiser/performer payouts via `payout_organizer()` |
| **Custom Tokens** | Optional event-issued ticket assets or NFT-like passes (trustline-gated) |
| **Trustlines** | Ticket asset ownership and secure peer-to-peer transfers |
| **Event Logs** | On-chain events emitted at registration and scan time for audit trails and analytics |

---

## Target Users

- Concertgoers and students attending campus events in the **Philippines, Vietnam, and Indonesia**
- Conference participants seeking verifiable, tamper-proof credentials
- Event organisers and universities wanting fraud-resistant ticketing
- Ticketing platforms integrating blockchain-backed anti-fraud protection

---

## Contract ID Link:
https://lab.stellar.org/r/testnet/contract/CB2JFBHNCJU3YPQPN4OUXQGJWOX6J56SVZMVJSUM4VCEO6QX6LW4OKUH

## Architecture (MVP)

```
Organiser / Platform
        │
        │  register_ticket(ticket_hash, owner, event_hash, price)
        ▼
┌─────────────────────────────────┐
│   StellarPass Soroban Contract  │
│                                 │
│  TicketRecord {                 │
│    ticket_hash: Bytes,          │
│    owner:       Address,        │
│    event_hash:  Bytes,          │
│    price_stroops: i128,         │
│  }                              │
│                                 │
│  Used flag: Bytes → bool        │
└──────────┬──────────────────────┘
           │
           │  verify_ticket(ticket_hash, event_hash)
           ▼
     Venue Gate Scanner
           │
           │  payout_organizer(xlm_token, from, organizer, amount)
           ▼
     Organiser Wallet (XLM)
```

---

## Suggested MVP Timeline

| Week | Milestone |
|------|-----------|
| 1 | Finalise Soroban contract, local unit tests passing |
| 2 | Deploy to Stellar Testnet; build minimal web scanning UI |
| 3 | Integrate XLM payout flow; connect front-end to contract |
| 4 | Pilot at one campus event; gather feedback, fix bugs |
| 5 | Harden security, add custom token / trustline support |
| 6 | Testnet demo, documentation, and hackathon submission |

---

## Prerequisites

| Tool | Version |
|------|---------|
| Rust toolchain | `stable` (≥ 1.74 recommended) — install via [rustup](https://rustup.rs) |
| `wasm32` target | `rustup target add wasm32-unknown-unknown` |
| Soroban CLI | `cargo install --locked soroban-cli` (v21.x) |
| Stellar Testnet account | Create & fund at [https://laboratory.stellar.org](https://laboratory.stellar.org) |

---

## Build

```bash
# Compile the Soroban Wasm binary
soroban contract build

# Output: target/wasm32-unknown-unknown/release/stellarpass.wasm
```

---

## Run Tests

```bash
# Run all three unit tests
cargo test

# Verbose output
cargo test -- --nocapture
```

Expected output:

```
running 3 tests
test tests::test_happy_path_register_and_payout     ... ok
test tests::test_duplicate_registration_rejected    ... ok
test tests::test_storage_state_after_registration_and_verify ... ok

test result: ok. 3 passed; 0 failed
```

---

## Deploy to Testnet

```bash
# 1. Set up your Testnet identity (one-time)
soroban keys generate --global alice --network testnet

# 2. Fund the account via Friendbot
soroban keys fund alice --network testnet

# 3. Deploy the compiled Wasm
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpass.wasm \
  --source alice \
  --network testnet

# The command prints a CONTRACT_ID — save it for the CLI calls below.
```

---

## Sample CLI Invocations

Replace `<CONTRACT_ID>` with the deployed contract address printed above.

### register_ticket

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  register_ticket \
  --ticket_hash "54494b4554484153483030310000000000000000000000000000000000000001" \
  --owner  "GABC1234EXAMPLEOWNERWALLETADDRESSSTELLAR000000000000000000" \
  --event_hash "4556454e5448415348424749474e494748543230323500000000000000000001" \
  --price_stroops 5000000
```

### verify_ticket

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  verify_ticket \
  --ticket_hash "54494b4554484153483030310000000000000000000000000000000000000001" \
  --event_hash  "4556454e5448415348424749474e494748543230323500000000000000000001"
```

Expected response on first scan: `true`
Expected response on second scan (duplicate): `Error: AlreadyUsed (3)`

### payout_organizer

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  payout_organizer \
  --xlm_token  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC" \
  --from       "GABC1234EXAMPLEPAYERWALLETADDRESS00000000000000000000000000" \
  --organizer  "GORG5678EXAMPLEORGANIZERWALLETADDRESS000000000000000000000" \
  --amount_stroops 5000000
```

---

## Contract Functions Reference

| Function | Description |
|---|---|
| `register_ticket(ticket_hash, owner, event_hash, price_stroops)` | Mint a new on-chain ticket; rejects duplicates and empty event hashes |
| `verify_ticket(ticket_hash, event_hash)` | Validate at gate; marks ticket used; rejects re-scans and tampered hashes |
| `payout_organizer(xlm_token, from, organizer, amount_stroops)` | Transfer XLM from payer to organiser wallet |
| `get_ticket(ticket_hash)` | Read-only: return the full `TicketRecord` |
| `is_used(ticket_hash)` | Read-only: return `true` if ticket has been scanned |

---

## Error Codes

| Code | Name | Meaning |
|------|------|---------|
| 1 | `AlreadyRegistered` | Duplicate ticket hash — issuance rejected |
| 2 | `NotFound` | No ticket found for the given hash |
| 3 | `AlreadyUsed` | Ticket was already scanned — deny re-entry |
| 4 | `TamperedHash` | `event_hash` mismatch — possible forgery |
| 5 | `Unauthorized` | Caller lacks the required authority |

---

## License

```
MIT License

Copyright (c) 2025 StellarPass Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
