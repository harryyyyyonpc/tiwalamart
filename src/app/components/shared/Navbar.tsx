import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Shield, Wallet, Menu, X, LayoutDashboard, ShoppingBag, Plus, LogOut } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, walletAddress, disconnectWallet } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    ...(isConnected
      ? [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/create-listing', label: 'Sell', icon: Plus },
        ]
      : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[#0a0118]/80">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40 group-hover:shadow-violet-700/50 transition-shadow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Tiwala<span className="text-violet-400">Mart</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                isActive(to)
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Wallet Button */}
        <div className="hidden md:flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-900/40 border border-violet-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-violet-200 font-mono">{walletAddress}</span>
              </div>
              <button
                onClick={() => { disconnectWallet(); navigate('/'); }}
                className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/connect')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-900/30"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/70 hover:text-white transition"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-2 border-t border-white/10 pt-3">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <button
              key={to}
              onClick={() => { navigate(to); setMobileOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                isActive(to)
                  ? 'bg-violet-600/30 text-violet-300'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
          {isConnected ? (
            <button
              onClick={() => { disconnectWallet(); navigate('/'); setMobileOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-900/10 transition"
            >
              <LogOut className="w-4 h-4" /> Disconnect
            </button>
          ) : (
            <button
              onClick={() => { navigate('/connect'); setMobileOpen(false); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm"
            >
              <Wallet className="w-4 h-4" /> Connect Wallet
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
