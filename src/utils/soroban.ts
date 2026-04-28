// /**
//  * soroban.ts — TiwalaMart escrow contract calls
//  * Uses @stellar/stellar-sdk v15 for transaction building,
//  * but calls the Soroban RPC directly via fetch to avoid
//  * version-mismatch issues with the SorobanRpc namespace.
//  */

// import {
//   Contract,
//   Networks,
//   TransactionBuilder,
//   Transaction,
//   BASE_FEE,
//   nativeToScVal,
//   Address,
//   scValToNative,
//   xdr,
//   SorobanDataBuilder,
// } from '@stellar/stellar-sdk';
// import { signWithFreighter } from './wallet';

// const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID as string;
// const RPC_URL     = import.meta.env.VITE_RPC_URL as string;
// const NETWORK     = import.meta.env.VITE_STELLAR_NETWORK as string;
// const XLM_TOKEN   = import.meta.env.VITE_XLM_TOKEN as string;

// const NETWORK_PASSPHRASE =
//   NETWORK === 'MAINNET' ? Networks.PUBLIC : Networks.TESTNET;

// // ── Raw RPC fetch helpers ──────────────────────────────────────────────────

// let _rpcId = 1;

// async function rpcCall(method: string, params: unknown): Promise<any> {
//   const res = await fetch(RPC_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ jsonrpc: '2.0', id: _rpcId++, method, params }),
//   });
//   const json = await res.json();
//   if (json.error) throw new Error(`RPC ${method} error: ${JSON.stringify(json.error)}`);
//   return json.result;
// }

// async function getAccount(address: string) {
//   const HORIZON_URL = import.meta.env.VITE_HORIZON_URL as string;
//   const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
//   if (!res.ok) throw new Error(`Account ${address} not found. Make sure it is funded on Testnet.`);
//   return res.json();
// }

// async function simulateTransaction(txXdr: string) {
//   return rpcCall('simulateTransaction', { transaction: txXdr });
// }

// async function sendTransaction(txXdr: string) {
//   return rpcCall('sendTransaction', { transaction: txXdr });
// }

// async function getTransaction(hash: string) {
//   return rpcCall('getTransaction', { hash });
// }

// // ── Types ──────────────────────────────────────────────────────────────────

// export type OnChainStatus = 'Locked' | 'Released' | 'Refunded';

// export interface EscrowState {
//   buyer: string;
//   seller: string;
//   token: string;
//   amount: bigint;
//   status: OnChainStatus;
// }

// export function xlmToStroops(xlm: number): bigint {
//   return BigInt(Math.round(xlm * 10_000_000));
// }

// function assertAccountAddress(address: string, label: string) {
//   if (!address || !address.startsWith('G') || address.length < 56) {
//     throw new Error(
//       `${label} must be a Stellar G... account address. Got: "${address?.slice(0, 12)}..."`
//     );
//   }
// }

// // ── Core invoke ───────────────────────────────────────────────────────────

// async function invokeContract(
//   callerAddress: string,
//   method: string,
//   args: xdr.ScVal[]
// ): Promise<string> {
//   assertAccountAddress(callerAddress, 'Caller');

//   // 1. Get account sequence via RPC
//   const accountInfo = await getAccount(callerAddress);
//   if (!accountInfo) throw new Error(`Account ${callerAddress} not found on Testnet. Fund it first.`);

//   // Build a minimal account object for TransactionBuilder
//   // const account = {
//   //   accountId: () => callerAddress,
//   //   sequenceNumber: () => accountInfo.sequence,
//   //   incrementSequenceNumber() {
//   //     this._seq = (BigInt(accountInfo.sequence) + 1n).toString();
//   //   },
//   //   _seq: accountInfo.sequence,
//   // };

//   // 2. Build transaction
//   const contract = new Contract(CONTRACT_ID);
//   const tx = new TransactionBuilder(
//     { accountId: () => callerAddress, sequenceNumber: () => accountInfo.sequence, incrementSequenceNumber: () => {} } as any,
//     { fee: String(BASE_FEE), networkPassphrase: NETWORK_PASSPHRASE }
//   )
//     .addOperation(contract.call(method, ...args))
//     .setTimeout(60)
//     .build();

//   const txXdr = tx.toEnvelope().toXDR('base64');

//   // 3. Simulate
//   const simResult = await simulateTransaction(txXdr);
//   console.log("=== SIM RESULT ===");
//   console.log("METHOD:", method);
//   console.log("ARGS:", args);
//   console.log(simResult);
//   console.log("SIM AUTH RAW:", simResult.results?.[0]?.auth);
//   console.log("SIM AUTH COUNT:", simResult.results?.[0]?.auth?.length ?? 0);

//   if (simResult.error || simResult.results?.[0]?.error) {
//     throw new Error(JSON.stringify(simResult));
//   }

//   if (simResult.error) throw new Error(`Simulation failed: ${simResult.error}`);
//   if (!simResult.results?.[0]) throw new Error('Simulation returned no results');

//   // 4. Re-build with soroban data + resource fee from simulation
//   // const minFee = parseInt(BASE_FEE) + parseInt(simResult.minResourceFee ?? '0');
//   const minFee = Number(BASE_FEE) + Number(simResult.minResourceFee ?? 0);

//   // const tx2 = new TransactionBuilder(
//   //   { accountId: () => callerAddress, sequenceNumber: () => accountInfo.sequence, incrementSequenceNumber: () => {} } as any,
//   //   { fee: String(minFee), networkPassphrase: NETWORK_PASSPHRASE }
//   // )
//   //   .addOperation(contract.call(method, ...args))
//   //   .setTimeout(60);

//   // // if (simResult.transactionData) {
//   // //   tx2.setSorobanData(simResult.transactionData);
//   // // }
//   // if (simResult.transactionData) {
//   //   const sorobanData = xdr.SorobanTransactionData.fromXDR(
//   //     simResult.transactionData,
//   //     'base64'
//   //   );
//   //   tx2.setSorobanData(sorobanData);
//   // }

//   // const preparedTx = tx2.build();

//   // console.log("SIM RESULT AUTH:", simResult.results?.[0]?.auth);
//   // // // Attach auth entries if present
//   // if (simResult.results?.[0]?.auth?.length) {
//   //   const op = preparedTx.operations[0] as any;
//   //   op.auth = simResult.results[0].auth.map((a: string) =>
//   //     xdr.SorobanAuthorizationEntry.fromXDR(a, 'base64')
//   //   );
//   // }

//   // 4. Apply simulation result directly to tx
//   const tx2 = TransactionBuilder.cloneFrom(tx, {
//     fee: String(minFee),
//   });
  
//   if (simResult.transactionData) {
//     tx2.setSorobanData(
//       xdr.SorobanTransactionData.fromXDR(
//         simResult.transactionData,
//         'base64'
//       )
//     );
//   }
  
//   const preparedTx = tx2.build();
  
//   // Inject auth directly into raw envelope
//   // const envelope = preparedTx.tx;
//   const envelope = (preparedTx as any).tx;

//   const authEntries =
//     simResult.results?.[0]?.auth?.map((a: string) =>
//       xdr.SorobanAuthorizationEntry.fromXDR(a, 'base64')
//     ) ?? [];
//   console.log("AUTH ENTRIES PARSED:", authEntries.length);

//   if (authEntries.length > 0) {
//     const op = envelope.operations()[0];
  
//     if (op.body().switch().name === "invokeHostFunction") {
//       op.body().invokeHostFunctionOp().auth(authEntries);
//     }
//   }
  
//   const finalEnvelope = new Transaction(
//     xdr.TransactionEnvelope.envelopeTypeTx(
//       new xdr.TransactionV1Envelope({
//         tx: envelope,
//         signatures: [],
//       })
//     ).toXDR("base64"),
//     NETWORK_PASSPHRASE
//   );

//   // 5. Sign with Freighter
//   const preparedXdr = finalEnvelope.toEnvelope().toXDR('base64');
//   console.log("=== FINAL PREPARED XDR ===");
//   console.log(finalEnvelope.toEnvelope().toXDR("base64"));
//   const signedXdr   = await signWithFreighter(preparedXdr, NETWORK_PASSPHRASE);
//   console.log("=== SIGNED XDR ===");
//   console.log(signedXdr);

//   const decoded = new Transaction(signedXdr, NETWORK_PASSPHRASE);

//   console.log("SIGNED OPS:", decoded.operations);
//   console.log("SIGNED AUTH:", (decoded.operations[0] as any).auth);

//   // 6. Submit
//   const submitResult = await sendTransaction(signedXdr);
//   if (submitResult.status === 'ERROR') {
//     throw new Error(`Submission error: ${JSON.stringify(submitResult)}`);
//   }

//   // 7. Poll
//   const hash = submitResult.hash;
//   if (!hash) throw new Error('No transaction hash returned');

//   for (let i = 0; i < 15; i++) {
//     await new Promise((r) => setTimeout(r, 2000));
//     const status = await getTransaction(hash);
//     if (status.status === 'SUCCESS') return hash;
//     if (status.status === 'FAILED') {
//       console.log("FULL TX RESULT:", JSON.stringify(status, null, 2));
//       throw new Error(`FAILED TX: ${hash}`);
//     }
//   }
//   throw new Error(`Timed out waiting for confirmation. Hash: ${hash}`);
// }

// // ── Read-only query ───────────────────────────────────────────────────────

// async function simulateQuery(method: string, args: xdr.ScVal[], callerAddress: string): Promise<xdr.ScVal> {
//   // Use the caller's account (a real G... account) as the source for simulation
//   const accountInfo = await getAccount(callerAddress);

//   const contract = new Contract(CONTRACT_ID);
//   const tx = new TransactionBuilder(
//     { accountId: () => callerAddress, sequenceNumber: () => accountInfo.sequence, incrementSequenceNumber: () => {} } as any,
//     { fee: String(BASE_FEE), networkPassphrase: NETWORK_PASSPHRASE }
//   )
//     .addOperation(contract.call(method, ...args))
//     .setTimeout(30)
//     .build();

//   const txXdr     = tx.toEnvelope().toXDR('base64');
//   const simResult = await simulateTransaction(txXdr);
//   console.log("=== SIM RESULT RAW ===");
// console.log(JSON.stringify(simResult, null, 2));

// console.log("=== DEBUG INFO ===");
// console.log("method:", method);
// console.log("contract:", CONTRACT_ID);

//   if (simResult.error) throw new Error(`Query failed: ${simResult.error}`);

//   const retvalB64 = simResult.results?.[0]?.xdr;
//   if (!retvalB64) throw new Error(`No return value from ${method}`);

//   return xdr.ScVal.fromXDR(retvalB64, 'base64');
// }

// // ── Public contract functions ─────────────────────────────────────────────

// export async function createEscrow(
//   buyerAddress: string,
//   sellerAddress: string,
//   amountXlm: number
// ): Promise<{ txHash: string; escrowId: number }> {
//   assertAccountAddress(buyerAddress, 'Buyer');
//   assertAccountAddress(sellerAddress, 'Seller');
//   if (!buyerAddress) throw new Error("No wallet connected");

//   const args: xdr.ScVal[] = [
//     new Address(buyerAddress).toScVal(),
//     new Address(sellerAddress).toScVal(),
//     new Address(XLM_TOKEN).toScVal(),
//     nativeToScVal(xlmToStroops(amountXlm), { type: 'i128' }),
//   ];

//   // const txHash   = await invokeContract(buyerAddress, 'create_escrow', args);
//   // const escrowId = await getLatestEscrowId(buyerAddress);
//   // return { txHash, escrowId };
  
//   // const txHash   = await invokeContract(buyerAddress, 'create_escrow', args);
  
//   // return { txHash, escrowId: 1 };
//   const txHash = await invokeContract(buyerAddress, 'create_escrow', args);
//   return { txHash, escrowId: 1 };
// }

// export async function confirmDelivery(
//   buyerAddress: string,
//   escrowId: number
// ): Promise<string> {
//   console.log("=== confirmDelivery ENTRY ===");
//   console.log("buyerAddress:", buyerAddress);
//   console.log("escrowId:", escrowId);
//   console.log("typeof escrowId:", typeof escrowId);
//   assertAccountAddress(buyerAddress, 'Buyer');
//   return invokeContract(buyerAddress, 'confirm_delivery', [
//     nativeToScVal(BigInt(escrowId)),
//     new Address(buyerAddress).toScVal(),
//   ]);
// }

// export async function refundBuyer(
//   callerAddress: string,
//   escrowId: number
// ): Promise<string> {
//   assertAccountAddress(callerAddress, 'Caller');
//   return invokeContract(callerAddress, 'refund_buyer', [
//     nativeToScVal(BigInt(escrowId), { type: 'u64' }),
//     new Address(callerAddress).toScVal(),
//   ]);
// }

// export async function getEscrow(escrowId: number, callerAddress?: string): Promise<EscrowState> {
//   // For read-only queries we need any funded account — use a known funded testnet account as fallback
//   const caller = callerAddress ?? 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';
//   const retval = await simulateQuery('get_escrow', [
//     nativeToScVal(BigInt(escrowId), { type: 'u64' }),
//   ], caller);
//   const native = scValToNative(retval) as any;
//   return {
//     buyer:  native.buyer,
//     seller: native.seller,
//     token:  native.token,
//     amount: native.amount,
//     status: String(native.status) as OnChainStatus,
//   };
// }

// // async function getLatestEscrowId(callerAddress?: string): Promise<number> {
// //   let lastGood = 1;
// //   for (let i = 1; i <= 500; i++) {
// //     try { await getEscrow(i, callerAddress); lastGood = i; }
// //     catch { break; }
// //   }
// //   return lastGood;
// // }

/**
 * soroban.ts — TiwalaMart escrow contract calls
 * Uses @stellar/stellar-sdk v15 for transaction building,
 * but calls the Soroban RPC directly via fetch to avoid
 * version-mismatch issues with the SorobanRpc namespace.
 */

import {
  Contract,
  Networks,
  TransactionBuilder,
  Transaction,
  BASE_FEE,
  nativeToScVal,
  Address,
  scValToNative,
  xdr,
  SorobanDataBuilder,
} from '@stellar/stellar-sdk';
import { signWithFreighter } from './wallet';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID as string;
const RPC_URL     = import.meta.env.VITE_RPC_URL as string;
const NETWORK     = import.meta.env.VITE_STELLAR_NETWORK as string;
const XLM_TOKEN   = import.meta.env.VITE_XLM_TOKEN as string;

const NETWORK_PASSPHRASE =
  NETWORK === 'MAINNET' ? Networks.PUBLIC : Networks.TESTNET;

// ── Raw RPC fetch helpers ──────────────────────────────────────────────────

let _rpcId = 1;

async function rpcCall(method: string, params: unknown): Promise<any> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: _rpcId++, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`RPC ${method} error: ${JSON.stringify(json.error)}`);
  return json.result;
}

async function getAccount(address: string) {
  const HORIZON_URL = import.meta.env.VITE_HORIZON_URL as string;
  const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
  if (!res.ok) throw new Error(`Account ${address} not found. Make sure it is funded on Testnet.`);
  return res.json();
}

async function simulateTransaction(txXdr: string) {
  return rpcCall('simulateTransaction', { transaction: txXdr });
}

async function sendTransaction(txXdr: string) {
  return rpcCall('sendTransaction', { transaction: txXdr });
}

async function getTransaction(hash: string) {
  return rpcCall('getTransaction', { hash });
}

// ── Types ──────────────────────────────────────────────────────────────────

export type OnChainStatus = 'Locked' | 'Released' | 'Refunded';

export interface EscrowState {
  buyer: string;
  seller: string;
  token: string;
  amount: bigint;
  status: OnChainStatus;
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}

function assertAccountAddress(address: string, label: string) {
  if (!address || !address.startsWith('G') || address.length < 56) {
    throw new Error(
      `${label} must be a Stellar G... account address. Got: "${address?.slice(0, 12)}..."`
    );
  }
}

// ── Core invoke ───────────────────────────────────────────────────────────

async function invokeContract(
  callerAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<{ hash: string; returnValue: xdr.ScVal | null }> {
  assertAccountAddress(callerAddress, 'Caller');

  // 1. Get account sequence via RPC
  const accountInfo = await getAccount(callerAddress);
  if (!accountInfo) throw new Error(`Account ${callerAddress} not found on Testnet. Fund it first.`);

  // Build a minimal account object for TransactionBuilder
  // const account = {
  //   accountId: () => callerAddress,
  //   sequenceNumber: () => accountInfo.sequence,
  //   incrementSequenceNumber() {
  //     this._seq = (BigInt(accountInfo.sequence) + 1n).toString();
  //   },
  //   _seq: accountInfo.sequence,
  // };

  // 2. Build transaction
  const contract = new Contract(CONTRACT_ID);
  const tx = new TransactionBuilder(
    { accountId: () => callerAddress, sequenceNumber: () => accountInfo.sequence, incrementSequenceNumber: () => {} } as any,
    { fee: String(BASE_FEE), networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const txXdr = tx.toEnvelope().toXDR('base64');

  // 3. Simulate
  const simResult = await simulateTransaction(txXdr);
  console.log("=== SIM RESULT ===");
  console.log("METHOD:", method);
  console.log("ARGS:", args);
  console.log(simResult);
  console.log("SIM AUTH RAW:", simResult.results?.[0]?.auth);
  console.log("SIM AUTH COUNT:", simResult.results?.[0]?.auth?.length ?? 0);

  if (simResult.error || simResult.results?.[0]?.error) {
    throw new Error(JSON.stringify(simResult));
  }

  if (simResult.error) throw new Error(`Simulation failed: ${simResult.error}`);
  if (!simResult.results?.[0]) throw new Error('Simulation returned no results');

  // 4. Re-build with soroban data + resource fee from simulation
  // const minFee = parseInt(BASE_FEE) + parseInt(simResult.minResourceFee ?? '0');
  const minFee = Number(BASE_FEE) + Number(simResult.minResourceFee ?? 0);

  // const tx2 = new TransactionBuilder(
  //   { accountId: () => callerAddress, sequenceNumber: () => accountInfo.sequence, incrementSequenceNumber: () => {} } as any,
  //   { fee: String(minFee), networkPassphrase: NETWORK_PASSPHRASE }
  // )
  //   .addOperation(contract.call(method, ...args))
  //   .setTimeout(60);

  // // if (simResult.transactionData) {
  // //   tx2.setSorobanData(simResult.transactionData);
  // // }
  // if (simResult.transactionData) {
  //   const sorobanData = xdr.SorobanTransactionData.fromXDR(
  //     simResult.transactionData,
  //     'base64'
  //   );
  //   tx2.setSorobanData(sorobanData);
  // }

  // const preparedTx = tx2.build();

  // console.log("SIM RESULT AUTH:", simResult.results?.[0]?.auth);
  // // // Attach auth entries if present
  // if (simResult.results?.[0]?.auth?.length) {
  //   const op = preparedTx.operations[0] as any;
  //   op.auth = simResult.results[0].auth.map((a: string) =>
  //     xdr.SorobanAuthorizationEntry.fromXDR(a, 'base64')
  //   );
  // }

  // 4. Apply simulation result directly to tx
  const tx2 = TransactionBuilder.cloneFrom(tx, {
    fee: String(minFee),
  });
  
  if (simResult.transactionData) {
    tx2.setSorobanData(
      xdr.SorobanTransactionData.fromXDR(
        simResult.transactionData,
        'base64'
      )
    );
  }
  
  const preparedTx = tx2.build();
  
  // Inject auth directly into raw envelope
  // const envelope = preparedTx.tx;
  const envelope = (preparedTx as any).tx;

  const authEntries =
    simResult.results?.[0]?.auth?.map((a: string) =>
      xdr.SorobanAuthorizationEntry.fromXDR(a, 'base64')
    ) ?? [];
  console.log("AUTH ENTRIES PARSED:", authEntries.length);

  // Only explicitly set auth when the simulation returned entries.
  // When auth is empty, the tx source account's signature provides implicit
  // authorization — manually setting auth([]) would CLEAR that and break it.
  if (authEntries.length > 0) {
    const op = envelope.operations()[0];
  
    if (op.body().switch().name === "invokeHostFunction") {
      op.body().invokeHostFunctionOp().auth(authEntries);
    }
  }
  
  const finalEnvelope = new Transaction(
    xdr.TransactionEnvelope.envelopeTypeTx(
      new xdr.TransactionV1Envelope({
        tx: envelope,
        signatures: [],
      })
    ).toXDR("base64"),
    NETWORK_PASSPHRASE
  );

  // 5. Sign with Freighter
  const preparedXdr = finalEnvelope.toEnvelope().toXDR('base64');
  console.log("=== FINAL PREPARED XDR ===");
  console.log(finalEnvelope.toEnvelope().toXDR("base64"));
  const signedXdr   = await signWithFreighter(preparedXdr, NETWORK_PASSPHRASE);
  console.log("=== SIGNED XDR ===");
  console.log(signedXdr);

  const decoded = new Transaction(signedXdr, NETWORK_PASSPHRASE);

  console.log("SIGNED OPS:", decoded.operations);
  console.log("SIGNED AUTH:", (decoded.operations[0] as any).auth);

  // 6. Submit
  const submitResult = await sendTransaction(signedXdr);
  if (submitResult.status === 'ERROR') {
    throw new Error(`Submission error: ${JSON.stringify(submitResult)}`);
  }

  // 7. Poll
  const hash = submitResult.hash;
  if (!hash) throw new Error('No transaction hash returned');

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const status = await getTransaction(hash);
    if (status.status === 'SUCCESS') {
      let returnValue: xdr.ScVal | null = null;
      try {
        // Try resultMetaXdr first (TransactionMeta v3 → sorobanMeta → returnValue)
        if (status.resultMetaXdr) {
          const meta = xdr.TransactionMeta.fromXDR(status.resultMetaXdr, 'base64');
          // The union arm is accessed via .value() in stellar-sdk v15 XDR
          const inner = (meta as any).value?.();
          const sorobanMeta = inner?.sorobanMeta?.();
          if (sorobanMeta) {
            returnValue = sorobanMeta.returnValue();
          }
        }
      } catch (e) {
        console.warn('Could not parse returnValue from resultMetaXdr:', e);
      }
      // Fallback: try the top-level returnValue field some RPC versions expose
      if (!returnValue && (status as any).returnValue) {
        try {
          returnValue = xdr.ScVal.fromXDR((status as any).returnValue, 'base64');
        } catch (e) {
          console.warn('Could not parse returnValue from status.returnValue:', e);
        }
      }
      return { hash, returnValue };
    }
    if (status.status === 'FAILED') {
      console.log("FULL TX RESULT:", JSON.stringify(status, null, 2));
      throw new Error(`FAILED TX: ${hash}`);
    }
  }
  throw new Error(`Timed out waiting for confirmation. Hash: ${hash}`);
}

// ── Read-only query ───────────────────────────────────────────────────────

async function simulateQuery(method: string, args: xdr.ScVal[], callerAddress: string): Promise<xdr.ScVal> {
  // Use the caller's account (a real G... account) as the source for simulation
  const accountInfo = await getAccount(callerAddress);

  const contract = new Contract(CONTRACT_ID);
  const tx = new TransactionBuilder(
    { accountId: () => callerAddress, sequenceNumber: () => accountInfo.sequence, incrementSequenceNumber: () => {} } as any,
    { fee: String(BASE_FEE), networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const txXdr     = tx.toEnvelope().toXDR('base64');
  const simResult = await simulateTransaction(txXdr);
  console.log("=== SIM RESULT RAW ===");
console.log(JSON.stringify(simResult, null, 2));

console.log("=== DEBUG INFO ===");
console.log("method:", method);
console.log("contract:", CONTRACT_ID);

  if (simResult.error) throw new Error(`Query failed: ${simResult.error}`);

  const retvalB64 = simResult.results?.[0]?.xdr;
  if (!retvalB64) throw new Error(`No return value from ${method}`);

  return xdr.ScVal.fromXDR(retvalB64, 'base64');
}

// ── Public contract functions ─────────────────────────────────────────────

export async function createEscrow(
  buyerAddress: string,
  sellerAddress: string,
  amountXlm: number
): Promise<{ txHash: string; escrowId: number }> {
  assertAccountAddress(buyerAddress, 'Buyer');
  assertAccountAddress(sellerAddress, 'Seller');
  if (!buyerAddress) throw new Error("No wallet connected");

  const args: xdr.ScVal[] = [
    new Address(buyerAddress).toScVal(),
    new Address(sellerAddress).toScVal(),
    new Address(XLM_TOKEN).toScVal(),
    nativeToScVal(xlmToStroops(amountXlm), { type: 'i128' }),
  ];

  const { hash: txHash, returnValue } = await invokeContract(buyerAddress, 'create_escrow', args);

  // The contract returns the new escrow ID as a u64. Parse it from the tx return value.
  let escrowId = 1; // fallback
  try {
    if (returnValue) {
      const native = scValToNative(returnValue);
      escrowId = Number(native);
      console.log("Parsed escrowId from tx returnValue:", escrowId);
    }
  } catch (e) {
    console.warn("Could not parse escrowId from returnValue, falling back to 1:", e);
  }

  return { txHash, escrowId };
}

export async function confirmDelivery(
  buyerAddress: string,
  escrowId: number
): Promise<string> {
  console.log("=== confirmDelivery ENTRY ===");
  console.log("buyerAddress:", buyerAddress);
  console.log("escrowId:", escrowId);
  console.log("typeof escrowId:", typeof escrowId);
  assertAccountAddress(buyerAddress, 'Buyer');
  const { hash } = await invokeContract(buyerAddress, 'confirm_delivery', [
    nativeToScVal(BigInt(escrowId), { type: 'u64' }),
    new Address(buyerAddress).toScVal(),
  ]);
  return hash;
}

export async function refundBuyer(
  callerAddress: string,
  escrowId: number
): Promise<string> {
  assertAccountAddress(callerAddress, 'Caller');
  const { hash } = await invokeContract(callerAddress, 'refund_buyer', [
    nativeToScVal(BigInt(escrowId), { type: 'u64' }),
    new Address(callerAddress).toScVal(),
  ]);
  return hash;
}

export async function getEscrow(escrowId: number, callerAddress?: string): Promise<EscrowState> {
  // For read-only queries we need any funded account — use a known funded testnet account as fallback
  const caller = callerAddress ?? 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';
  const retval = await simulateQuery('get_escrow', [
    nativeToScVal(BigInt(escrowId), { type: 'u64' }),
  ], caller);
  const native = scValToNative(retval) as any;
  return {
    buyer:  native.buyer,
    seller: native.seller,
    token:  native.token,
    amount: native.amount,
    status: String(native.status) as OnChainStatus,
  };
}

// async function getLatestEscrowId(callerAddress?: string): Promise<number> {
//   let lastGood = 1;
//   for (let i = 1; i <= 500; i++) {
//     try { await getEscrow(i, callerAddress); lastGood = i; }
//     catch { break; }
//   }
//   return lastGood;
// }