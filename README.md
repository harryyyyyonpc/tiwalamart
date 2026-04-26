# TiwalaMart

> **Trustless escrow payments for Southeast Asia — powered by Stellar Soroban.**

---

## Problem

Online transactions in the Philippines and across Southeast Asia suffer from a fundamental lack of trust. Buyers routinely send payments upfront via e-wallets with no guarantee that goods will be delivered or services completed. The result is a cycle of scams, failed deliveries, unresolved disputes, and eroding confidence in digital commerce — especially in informal and peer-to-peer marketplaces.

## Solution

TiwalaMart builds a **trustless escrow payment system** on Stellar using Soroban smart contracts. Funds are locked on-chain the moment a buyer initiates a transaction. They are only released to the seller after the buyer confirms fulfillment — or automatically refunded if the seller cannot deliver. No intermediary. No manual override. Pure conditional settlement enforced by contract logic.

*"Tiwala"* means **trust** in Filipino — and that is exactly what this protocol delivers.

---

## Stellar Features Used

| Feature | Role in TiwalaMart |
|---|---|
| **Soroban Smart Contracts** | Core escrow logic, conditional payment release, state tracking, dispute prevention |
| **XLM Transfers** | Locked payments and automatic settlement via the token client |
| **Custom Tokens** | Optional campus or platform-specific payment tokens (trustline-compatible) |
| **Trustlines** | Secure asset handling between users and merchants for non-native tokens |
| **Event Logs** | Real-time payment status updates: `locked`, `released`, `refunded` |

---

## Target Users

- Online buyers and sellers in informal marketplaces
- Freelance service providers (design, coding, tutoring, delivery)
- Small businesses transacting across PH, VN, and ID
- Any two parties who need conditional settlement without a middleman

---

## MVP Core Feature

A Soroban smart contract that:

1. **Locks** buyer funds in the contract on `create_escrow`
2. **Stores** full transaction state on-chain (`buyer`, `seller`, `token`, `amount`, `status`)
3. **Releases** funds to the seller when the buyer calls `confirm_delivery`
4. **Refunds** the buyer when either party calls `refund_buyer`
5. **Emits** on-chain events (`locked` / `released` / `refunded`) for every state transition
6. **Prevents** double-spend, unauthorised withdrawals, and re-entrancy via status guards

---

## Suggested MVP Timeline

| Week | Milestone |
|---|---|
| 1 | Soroban contract complete — `create_escrow`, `confirm_delivery`, `refund_buyer` |
| 2 | Unit tests passing; testnet deploy via Soroban CLI |
| 3 | React/Next.js frontend — connect wallet, create escrow, view status |
| 4 | Testnet end-to-end demo; README polished; pitch deck ready |

---

## Prerequisites

- **Rust toolchain** `1.74+` with `wasm32-unknown-unknown` target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- **Soroban CLI** `v22.x`:
  ```bash
  cargo install --locked soroban-cli --features opt
  ```
- **Stellar Testnet account** funded via Friendbot:
  ```bash
  soroban keys generate --global alice --network testnet
  soroban keys fund alice --network testnet
  ```

---

## Build

```bash
# Clone the repository
git clone https://github.com/your-org/tiwalamart
cd tiwalamart

# Build optimised Wasm binary
soroban contract build

# Output: target/wasm32-unknown-unknown/release/tiwala_mart.wasm
```

---

## Test

```bash
# Run all unit tests
cargo test

# Run with printed output (useful for debugging events)
cargo test -- --nocapture
```

Expected output:

```
running 3 tests
test tests::test_happy_path_create_confirm_release ... ok
test tests::test_edge_case_double_release_rejected ... ok
test tests::test_state_verification_storage_and_refund ... ok

test result: ok. 3 passed; 0 failed
```

---

## Deploy to Testnet

```bash
# Deploy the compiled contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/tiwala_mart.wasm \
  --source alice \
  --network testnet

# Output: CONTRACT_ID (save this — you'll need it for invocations)
# Example: CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Sample CLI Invocations

Replace `<CONTRACT_ID>`, `<BUYER>`, `<SELLER>`, and `<TOKEN>` with real testnet values.

### Create an Escrow (Buyer locks funds)

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  create_escrow \
  --buyer GBUYERWALLETADDRESS \
  --seller GSELLERWALLETADDRESS \
  --token CTOKENCONTRACTID \
  --amount 500

# Returns: tx_id (u64), e.g. 1
```

### Confirm Delivery (Buyer releases funds to seller)

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  confirm_delivery \
  --tx_id 1 \
  --buyer GBUYERWALLETADDRESS
```

### Refund Buyer (Seller or buyer cancels the escrow)

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  refund_buyer \
  --tx_id 1 \
  --caller GSELLERWALLETADDRESS
```

### Get Escrow State (Read-only)

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- \
  get_escrow \
  --tx_id 1
```

### Get Status Only

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- \
  get_status \
  --tx_id 1

# Returns: "Locked" | "Released" | "Refunded"
```

---

## Project Structure

```
tiwalamart/
├── Cargo.toml          # Package manifest & Wasm-optimised release profile
└── src/
    ├── lib.rs          # Soroban smart contract (escrow logic + events)
    └── test.rs         # 3 unit tests (happy path, edge case, state verification)
```

---

## Reference

- Stellar Bootcamp 2026: https://github.com/armlynobinguar/Stellar-Bootcamp-2026
- Community Treasury (full-stack example): https://github.com/armlynobinguar/community-treasury
- Soroban Docs: https://developers.stellar.org/docs/smart-contracts

---

## License

```
MIT License

Copyright (c) 2026 TiwalaMart

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## CONTRACT ID LINK:
https://lab.stellar.org/r/testnet/contract/CBCYIVECSJOOWTMTVKC5AZH3M2H3RHRKACNZP757LZALH4RMBFBRN76V
