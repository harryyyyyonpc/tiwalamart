import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useWallet } from '../../context/WalletContext';
import {
  Shield, Lock, Truck, CheckCircle, XCircle,
  AlertCircle, ArrowLeft, Loader2, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { PRODUCTS } from '../../data/mockData';
import type { EscrowStatus } from '../../data/mockData';
import { createEscrow, confirmDelivery, refundBuyer } from '../../../utils/soroban';

type FlowStatus = EscrowStatus | 'creating';

export function EscrowTransaction() {
  const navigate      = useNavigate();
  const { productId } = useParams();
  const { isConnected, walletAddress, addTransaction, refreshBalance } = useWallet();

  const [status, setStatus]           = useState<FlowStatus | null>(null);
  const [escrowId, setEscrowId]       = useState<number | null>(null);
  const [txHash, setTxHash]           = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Guard so we only auto-create once
  const didCreate = useRef(false);

  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => { if (!isConnected) navigate('/connect'); }, [isConnected, navigate]);
  useEffect(() => { if (!product) navigate('/marketplace'); }, [product, navigate]);

  useEffect(() => {
    if (!product || !walletAddress || didCreate.current) return;
    didCreate.current = true;
    handleCreateEscrow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, walletAddress]);

  if (!product) return null;

  async function handleCreateEscrow() {
    if (!walletAddress || !product) return;
    setError(null);
    setStatus('creating');
    try {
      const { txHash: hash, escrowId: id } = await createEscrow(
        walletAddress,
        product.seller,
        product.price
      );
      setTxHash(hash);
      setEscrowId(id);
      setStatus('locked');
      await refreshBalance();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create escrow';
      setError(msg);
      setStatus(null); // null = idle/error state, allows retry
      didCreate.current = false; // allow retry
    }
  }

  async function handleConfirmDelivery() {
    if (!walletAddress || escrowId === null) return;
    setError(null);
    setStatus('pending');
    try {
      const hash = await confirmDelivery(walletAddress, escrowId);
      setTxHash(hash);
      setStatus('released');
      setShowSuccess(true);
      addTransaction({
        id: Date.now().toString(),
        productName: product.name,
        amount: product.price,
        seller: product.seller,
        status: 'released',
        date: new Date().toISOString().split('T')[0],
        txHash: hash,
      });
      await refreshBalance();
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm delivery';
      setError(msg);
      setStatus('locked'); // go back to locked so buttons reappear
    }
  }

  async function handleRequestRefund() {
    if (!walletAddress || escrowId === null) return;
    setError(null);
    setStatus('pending');
    try {
      const hash = await refundBuyer(walletAddress, escrowId);
      setTxHash(hash);
      setStatus('refunded');
      await refreshBalance();
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request refund';
      setError(msg);
      setStatus('locked');
    }
  }

  const steps = [
    { icon: Lock,        label: 'Funds Locked',     sub: 'Payment in escrow',   key: 1 },
    { icon: Truck,       label: 'Awaiting Delivery', sub: 'Confirm on receipt',  key: 2 },
    { icon: CheckCircle, label: 'Funds Released',    sub: 'Seller receives XLM', key: 3 },
  ];

  const stepActive =
    status === 'creating' || status === null ? 0
    : status === 'locked'  ? 1
    : status === 'pending' ? 2
    : 3;

  return (
    <div className="min-h-screen bg-[#070011]">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/marketplace')}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="text-white font-semibold">Escrow Transaction</span>
          </div>
          {escrowId !== null && (
            <span className="ml-auto text-xs font-mono text-white/30">Escrow #{escrowId}</span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Creating spinner */}
        {status === 'creating' && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin flex-shrink-0" />
            <div>
              <p className="text-white font-semibold">Locking funds in escrow...</p>
              <p className="text-violet-300/60 text-sm">
                Approve the transaction in your Freighter extension
              </p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && status !== 'creating' && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-semibold">Transaction Error</p>
              <p className="text-red-300/70 text-sm mt-1 break-words">{error}</p>
              {/* Show retry only when escrow hasn't been created yet */}
              {(status === null) && (
                <button
                  onClick={() => {
                    didCreate.current = false;
                    handleCreateEscrow();
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm hover:bg-violet-600/30 transition"
                >
                  ↺ Retry escrow creation
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success banner */}
        {showSuccess && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle className="w-7 h-7 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold">Transaction complete!</p>
              <p className="text-emerald-400/70 text-sm">Funds released to seller. Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Product card */}
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-violet-900/20 border border-violet-500/10 flex items-center justify-center text-5xl flex-shrink-0">
              {product.emoji}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{product.name}</h2>
              <p className="text-white/40 text-sm mb-4">{product.description}</p>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-white/30 mb-1">Seller</p>
                  <p className="text-xs font-mono text-white/50 break-all">{product.seller}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">Price</p>
                  <p className="text-2xl font-bold text-white">
                    {product.price.toLocaleString()}{' '}
                    <span className="text-violet-400 text-base font-medium">XLM</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">USD Est.</p>
                  <p className="text-sm text-white/50">≈ ${(product.price * 0.12).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart contract notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
          <AlertCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-white/50">
            <span className="text-violet-300 font-medium">Smart contract active.</span>{' '}
            Funds of <span className="text-white font-medium">{product.price} XLM</span> are locked at{' '}
            <a
              href={`https://lab.stellar.org/r/testnet/contract/${import.meta.env.VITE_CONTRACT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 font-mono text-xs hover:text-violet-300 transition"
            >
              {(import.meta.env.VITE_CONTRACT_ID as string)?.slice(0, 14)}...
              <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
          </p>
        </div>

        {/* Progress tracker */}
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <h3 className="text-white font-semibold mb-6">Transaction Progress</h3>
          <div className="relative flex items-start justify-between">
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-700"
                style={{
                  width:
                    stepActive <= 1 ? '0%'
                    : stepActive === 2 ? '50%'
                    : '100%',
                }}
              />
            </div>
            {steps.map(({ icon: Icon, label, sub, key }) => {
              const active = key === stepActive;
              const done   = key < stepActive || (key === 3 && status === 'released');
              return (
                <div key={key} className="relative flex flex-col items-center gap-3 text-center w-1/3 px-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                      done || active
                        ? status === 'refunded' && key === 3
                          ? 'bg-white/10 border border-white/10'
                          : 'bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-900/40'
                        : 'bg-white/[0.03] border border-white/10'
                    }`}
                  >
                    {status === 'refunded' && key === 3
                      ? <XCircle className="w-6 h-6 text-white/30" />
                      : <Icon className={`w-6 h-6 ${done || active ? 'text-white' : 'text-white/20'}`} />
                    }
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${done || active ? 'text-white' : 'text-white/30'}`}>
                      {key === 3 && status === 'refunded' ? 'Refunded' : label}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">{sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction hash */}
        {txHash && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
            <span className="text-white/30 flex-shrink-0">Tx Hash:</span>
            <span className="font-mono text-violet-400/70 flex-1 truncate">{txHash}</span>
            <a
              href={`${import.meta.env.VITE_HORIZON_URL}/transactions/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Action buttons — only show when locked AND escrow exists */}
        {status === 'locked' && escrowId !== null && (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConfirmDelivery}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-xl shadow-violet-900/30"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Delivery &amp; Release Funds
            </button>
            <button
              onClick={handleRequestRefund}
              className="sm:w-48 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 text-white/60 font-medium hover:text-white hover:border-white/20 transition"
            >
              <XCircle className="w-5 h-5" />
              Request Refund
            </button>
          </div>
        )}

        {/* Processing */}
        {status === 'pending' && (
          <div className="flex items-center justify-center gap-3 p-6 rounded-xl border border-white/5 bg-white/[0.02] text-white/50">
            <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
            Processing on Stellar Testnet... approve in Freighter if prompted
          </div>
        )}

        {/* Released */}
        {status === 'released' && !showSuccess && (
          <div className="flex items-center gap-3 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            Transaction complete — funds released to seller
          </div>
        )}

        {/* Refunded */}
        {status === 'refunded' && (
          <div className="flex items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/10 text-white/40">
            <XCircle className="w-5 h-5" />
            Refund processed — funds returned to your wallet
          </div>
        )}
      </div>
    </div>
  );
}
