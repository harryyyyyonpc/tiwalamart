/**
 * src/utils/wallet.ts
 * Freighter wallet integration for TiwalaMart.
 */

import {
  isConnected,
  getAddress,
  getNetwork,
  signTransaction,
  requestAccess,
} from '@stellar/freighter-api';

const HORIZON_URL = import.meta.env.VITE_HORIZON_URL as string;

export interface FreighterWalletInfo {
  address: string;
  network: string;
  balance: number;
}

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

export async function connectFreighter(): Promise<string> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter is not installed. Please install it from https://www.freighter.app/');
  }
  const access = await requestAccess();
  if (access.error) throw new Error(`Freighter access denied: ${access.error}`);
  const addr = await getAddress();
  if (addr.error) throw new Error(`Could not get address: ${addr.error}`);
  return addr.address;
}

export async function getXLMBalance(publicKey: string): Promise<number> {
  try {
    const response = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
    if (!response.ok) return 0;
    const data = await response.json();
    const native = data.balances?.find((b: any) => b.asset_type === 'native');
    return native ? parseFloat(native.balance) : 0;
  } catch {
    return 0;
  }
}

export async function getWalletInfo(): Promise<FreighterWalletInfo> {
  const addr = await getAddress();
  if (addr.error) throw new Error('Wallet not connected');
  const net = await getNetwork();
  const balance = await getXLMBalance(addr.address);
  return { address: addr.address, network: net.network ?? 'TESTNET', balance };
}

export async function signWithFreighter(
  xdr: string,
  networkPassphrase: string
): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase });
  if (result.error) throw new Error(`Signing failed: ${result.error}`);
  return result.signedTxXdr;
}
