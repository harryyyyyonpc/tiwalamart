import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useWallet } from '../../context/WalletContext';
import {
  Wallet,
  TrendingUp,
  Shield,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Copy,
  ExternalLink,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import type { EscrowStatus } from '../../data/mockData';

function StatusBadge({ status }: { status: EscrowStatus }) {
  const config = {
    released: { label: 'Released', icon: CheckCircle, cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    locked: { label: 'Locked', icon: Lock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    pending: { label: 'Pending', icon: Clock, cls: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
    refunded: { label: 'Refunded', icon: XCircle, cls: 'text-white/30 bg-white/5 border-white/10' },
  };
  const { label, icon: Icon, cls } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, walletAddress, balance, transactions, disconnectWallet } = useWallet();

  useEffect(() => {
    if (!isConnected) navigate('/connect');
  }, [isConnected, navigate]);

  if (!isConnected) return null;

  const completed = transactions.filter((t) => t.status === 'released').length;
  const locked = transactions.filter((t) => t.status === 'locked').length;
  const totalSpent = transactions
    .filter((t) => t.status === 'released')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#070011]">
      {/* Header */}
      <div className="border-b border-white/5 bg-gradient-to-r from-violet-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">Connected to Stellar Testnet</span>
              </div>
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-white/40 mt-1 font-mono text-sm">{walletAddress}</p>
            </div>
            <button
              onClick={() => { disconnectWallet(); navigate('/'); }}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Balance card (prominent) */}
          <div className="col-span-2 relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-700 border border-violet-500/30 shadow-2xl shadow-violet-900/40">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 text-violet-200/70 text-sm mb-3">
                <Wallet className="w-4 h-4" />
                Wallet Balance
              </div>
              <div className="text-5xl font-bold text-white mb-1">{balance.toFixed(2)}</div>
              <div className="text-violet-200/60 font-medium">XLM ≈ ${(balance * 0.12).toFixed(2)} USD</div>
              <div className="mt-4 flex items-center gap-2 text-xs text-violet-200/50 font-mono bg-white/10 rounded-lg px-3 py-2">
                {walletAddress}
                <button className="ml-auto hover:text-white transition">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.03] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wide mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Completed
            </div>
            <div className="text-4xl font-bold text-white">{completed}</div>
            <div className="text-xs text-white/30 mt-1">{totalSpent.toLocaleString()} XLM spent</div>
          </div>

          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.03] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wide mb-3">
              <Lock className="w-4 h-4 text-amber-400" />
              In Escrow
            </div>
            <div className="text-4xl font-bold text-white">{locked}</div>
            <div className="text-xs text-white/30 mt-1">Active locks</div>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="group flex items-center gap-5 p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/40">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold mb-1">Browse Marketplace</div>
              <div className="text-sm text-white/40">Discover products with secure escrow payments</div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-violet-400 transition" />
          </button>

          <button
            onClick={() => navigate('/create-listing')}
            className="group flex items-center gap-5 p-6 rounded-2xl border border-dashed border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/10 transition">
              <Plus className="w-6 h-6 text-white/50 group-hover:text-violet-400 transition" />
            </div>
            <div className="flex-1">
              <div className="text-white/70 font-semibold mb-1 group-hover:text-white transition">Create Listing</div>
              <div className="text-sm text-white/30">Sell with smart contract protection</div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/10 group-hover:text-violet-400 transition" />
          </button>
        </div>

        {/* Transaction history */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h2 className="font-semibold text-white">Transaction History</h2>
            </div>
            <span className="text-xs text-white/30">{transactions.length} transactions</span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-16 text-center text-white/30">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No transactions yet
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{tx.productName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-white/30 font-mono">{tx.seller}</span>
                      <span className="text-xs text-white/20">{tx.date}</span>
                      {tx.txHash && (
                        <span className="text-xs font-mono text-violet-400/60 flex items-center gap-1">
                          {tx.txHash} <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold">{tx.amount.toLocaleString()} <span className="text-violet-400 text-sm">XLM</span></p>
                    <div className="mt-1">
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
