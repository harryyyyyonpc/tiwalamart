/**
 * WalletContext.tsx
 * Global wallet state — now backed by real Freighter + Soroban data.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { EscrowStatus, Transaction } from '../data/mockData';
import { MOCK_TRANSACTIONS } from '../data/mockData';
import {
  connectFreighter,
  getWalletInfo,
  isFreighterInstalled,
} from '../../utils/wallet';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  balance: number;
  network: string;
  transactions: Transaction[];
  error: string | null;
  freighterMissing: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  updateTransactionStatus: (id: string, status: EscrowStatus) => void;
  addTransaction: (transaction: Transaction) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected]     = useState(false);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance]             = useState(0);
  const [network, setNetwork]             = useState('TESTNET');
  const [error, setError]                 = useState<string | null>(null);
  const [freighterMissing, setFreighterMissing] = useState(false);
  const [transactions, setTransactions]   = useState<Transaction[]>(MOCK_TRANSACTIONS);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setFreighterMissing(false);

    try {
      const installed = await isFreighterInstalled();
      if (!installed) {
        setFreighterMissing(true);
        setError('Freighter is not installed. Please install the extension from freighter.app');
        return;
      }

      const address = await connectFreighter();
      const info    = await getWalletInfo();

      setWalletAddress(address);
      setBalance(info.balance);
      setNetwork(info.network ?? 'TESTNET');
      setIsConnected(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setBalance(0);
    setError(null);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const info = await getWalletInfo();
      setBalance(info.balance);
    } catch {
      // Silently fail on balance refresh
    }
  }, [walletAddress]);

  const updateTransactionStatus = useCallback((id: string, status: EscrowStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status } : tx))
    );
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        walletAddress,
        balance,
        network,
        transactions,
        error,
        freighterMissing,
        connectWallet,
        disconnectWallet,
        refreshBalance,
        updateTransactionStatus,
        addTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
