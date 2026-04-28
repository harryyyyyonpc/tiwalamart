import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useWallet } from '../../context/WalletContext';
import { Wallet, Loader2, CheckCircle, Shield, ArrowLeft, Lock, Zap, AlertTriangle, ExternalLink } from 'lucide-react';

export function WalletConnect() {
  const navigate = useNavigate();
  const {
    isConnected,
    isConnecting,
    walletAddress,
    balance,
    network,
    error,
    freighterMissing,
    connectWallet,
  } = useWallet();

  useEffect(() => {
    if (isConnected && walletAddress) {
      const t = setTimeout(() => navigate('/dashboard'), 1500);
      return () => clearTimeout(t);
    }
  }, [isConnected, walletAddress, navigate]);

  return (
    <div className="min-h-screen bg-[#070011] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">

          {/* Error state */}
          {error && !isConnecting && !isConnected && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">{error}</p>
                {freighterMissing && (
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-2 transition"
                  >
                    Install Freighter <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Idle state */}
          {!isConnecting && !isConnected && (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-900/60">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
                <p className="text-white/40 text-sm">
                  Connect your Stellar wallet to start buying and selling on TiwalaMart
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => connectWallet()}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">🚀</div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Freighter</p>
                    <p className="text-white/40 text-xs">Most popular Stellar wallet</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Connect
                  </span>
                </button>

                <div className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed text-left">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">🌐</div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Albedo</p>
                    <p className="text-white/40 text-xs">Coming soon</p>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-white/5">
                <div className="flex items-start gap-3 text-xs text-white/30">
                  <Shield className="w-4 h-4 text-violet-400/50 flex-shrink-0 mt-0.5" />
                  By connecting, you agree that all transactions are governed by Stellar Soroban smart contracts on {import.meta.env.VITE_STELLAR_NETWORK}.
                </div>
              </div>
            </>
          )}

          {/* Connecting state */}
          {isConnecting && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-2xl bg-violet-500/10 border border-violet-500/20" />
                <Loader2 className="w-10 h-10 text-violet-400 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connecting...</h3>
              <p className="text-white/40 text-sm mb-6">Approve the request in your Freighter extension</p>
              <div className="space-y-3 text-left">
                {[
                  { icon: Lock, text: 'Requesting wallet access' },
                  { icon: Zap, text: 'Connecting to Stellar Testnet' },
                  { icon: Shield, text: 'Loading XLM balance' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-white/40">
                    <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-violet-400" />
                    </div>
                    {text}
                    <div className="ml-auto w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected state */}
          {isConnected && walletAddress && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connected!</h3>
              <p className="text-white/40 text-sm mb-3">Wallet linked on <span className="text-violet-300">{network}</span></p>
              <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono text-white/50 mb-2">
                {walletAddress}
              </div>
              <p className="text-sm text-violet-300 font-medium">{balance.toFixed(2)} XLM</p>
              <p className="text-xs text-violet-400/60 mt-4 animate-pulse">Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
