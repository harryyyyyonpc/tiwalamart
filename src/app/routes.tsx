import { Route } from 'react-router';
import { RootLayout } from './components/RootLayout';
import { HomePage } from './components/pages/HomePage';
import { WalletConnect } from './components/pages/WalletConnect';
import { Dashboard } from './components/pages/Dashboard';
import { Marketplace } from './components/pages/Marketplace';
import { EscrowTransaction } from './components/pages/EscrowTransaction';
import { CreateListing } from './components/pages/CreateListing';

export const routes = (
  <Route path="/" element={<RootLayout />}>
    <Route index element={<HomePage />} />
    <Route path="connect" element={<WalletConnect />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="marketplace" element={<Marketplace />} />
    <Route path="create-listing" element={<CreateListing />} />
    <Route path="escrow/:productId" element={<EscrowTransaction />} />
  </Route>
);
