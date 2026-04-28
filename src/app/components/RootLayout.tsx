import { Outlet } from 'react-router';
import { Navbar } from './shared/Navbar';
import { WalletProvider } from '../context/WalletContext';

export function RootLayout() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-[#070011] text-white">
        <Navbar />
        <main className="pt-16">
          <Outlet />
        </main>
      </div>
    </WalletProvider>
  );
}
