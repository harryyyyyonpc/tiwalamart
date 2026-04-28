import { useNavigate } from 'react-router';
import { Shield, Lock, Zap, CheckCircle, ArrowRight, TrendingUp, Users, Globe } from 'lucide-react';
import { STATS } from '../../data/mockData';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 bg-[#070011]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-violet-800/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-900/20 backdrop-blur-sm mb-8 text-sm text-violet-300">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Powered by Stellar Soroban Smart Contracts
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Trade Without
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Trust Issues
            </span>
          </h1>

          <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            TiwalaMart locks payments in blockchain escrow until delivery is confirmed.
            Zero fraud. Full transparency. Every transaction — on-chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/marketplace')}
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-2xl shadow-violet-900/50 hover:shadow-violet-700/50 hover:-translate-y-0.5"
            >
              Browse Marketplace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/connect')}
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-violet-500/50 hover:bg-violet-900/20 transition-all font-medium backdrop-blur-sm"
            >
              <Shield className="w-4 h-4 text-violet-400" />
              Connect Wallet
            </button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'XLM Volume', value: STATS.totalVolume, icon: TrendingUp },
              { label: 'Listings', value: STATS.activeListings.toLocaleString(), icon: Globe },
              { label: 'In Escrow', value: STATS.escrowedNow.toLocaleString(), icon: Lock },
              { label: 'Success Rate', value: STATS.successRate, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm"
              >
                <Icon className="w-5 h-5 text-violet-400" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070011] via-[#0d0128] to-[#070011]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Trustless by Design
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                step: '01',
                title: 'Escrow Lock',
                desc: 'Payment is locked in a Soroban smart contract on Stellar. Funds cannot be accessed by anyone until conditions are met.',
                color: 'from-violet-600 to-violet-800',
                glow: 'shadow-violet-900/60',
              },
              {
                icon: Zap,
                step: '02',
                title: 'On-Chain Verification',
                desc: 'Delivery confirmation is submitted on-chain. Every action is transparent, immutable, and verifiable by both parties.',
                color: 'from-indigo-600 to-indigo-800',
                glow: 'shadow-indigo-900/60',
              },
              {
                icon: CheckCircle,
                step: '03',
                title: 'Instant Release',
                desc: 'Upon confirmation, the smart contract releases funds directly to the seller. Zero intermediaries. Zero delays.',
                color: 'from-emerald-600 to-teal-700',
                glow: 'shadow-emerald-900/60',
              },
            ].map(({ icon: Icon, step, title, desc, color, glow }) => (
              <div
                key={step}
                className="relative group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
              >
                <div className="text-xs font-mono text-white/20 mb-4">{step}</div>
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-xl ${glow} group-hover:-translate-y-1 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TiwalaMart */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">Why us</p>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                The safest way to trade in the Philippines and beyond
              </h2>
              <p className="text-white/40 leading-relaxed mb-8">
                TiwalaMart — <em className="text-white/60 not-italic">tiwala</em> means "trust" in Filipino — was built for buyers and sellers who deserve better than hope-and-pray commerce.
              </p>
              <div className="space-y-4">
                {[
                  'Smart contracts never lie — no chargebacks, no ghost sellers',
                  'On-chain dispute evidence protects both parties equally',
                  'XLM payments settle in 3-5 seconds with near-zero fees',
                  'No KYC required — your wallet is your identity',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-violet-400" />
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Dispute Resolution', value: '< 24h', sub: 'On-chain evidence' },
                { label: 'Settlement Time', value: '~4s', sub: 'Stellar speed' },
                { label: 'Transaction Fee', value: '< $0.01', sub: 'Near-zero cost' },
                { label: 'Fraud Rate', value: '0%', sub: 'Smart contract enforced' },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-violet-500/20 transition"
                >
                  <div className="text-3xl font-bold text-white mb-1">{value}</div>
                  <div className="text-sm text-violet-300 mb-1">{label}</div>
                  <div className="text-xs text-white/30">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#070011]" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-transparent to-indigo-900/20" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to trade
            <br />
            <span className="text-violet-400">with confidence?</span>
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            Connect your Stellar wallet and start trading on the most secure escrow marketplace in Web3.
          </p>
          <button
            onClick={() => navigate('/connect')}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg hover:from-violet-500 hover:to-indigo-500 transition-all shadow-2xl shadow-violet-900/50 hover:-translate-y-0.5"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="text-white/60 text-sm">TiwalaMart — Blockchain Escrow Marketplace</span>
          </div>
          <p className="text-white/30 text-xs">© 2026 TiwalaMart. Powered by Stellar Soroban.</p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>No backend yet — UI preview only</span>
            <Users className="w-4 h-4" />
          </div>
        </div>
      </footer>
    </div>
  );
}
