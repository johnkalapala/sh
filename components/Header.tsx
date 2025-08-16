import React from 'react';
import { Page, User } from '../types';
import { Icons } from './Icons';

interface HeaderProps {
  currentPage: Page;
  user: User;
  onDisconnect: () => void;
}

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  marketplace: 'Bond Marketplace',
  portfolio: 'My Portfolio',
  bondDetail: 'Bond Analysis',
  'system-analytics': 'System Analytics'
}

const Header: React.FC<HeaderProps> = ({ currentPage, user, onDisconnect }) => {

  const formatAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <header className="bg-brand-surface border-b border-brand-border sticky top-0 z-40 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-white">{pageTitles[currentPage]}</h1>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:flex items-center space-x-3 bg-brand-bg border border-brand-border px-3 py-1.5 rounded-lg">
                <Icons.cash className="text-brand-yellow" />
                <span className="font-mono text-white">₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-sm">
                    <span className="text-brand-text-secondary">Wallet: </span>
                    <span className="font-mono text-white">{formatAddress(user.walletAddress)}</span>
                </div>
                 <button onClick={onDisconnect} className="p-2 rounded-md hover:bg-brand-border transition-colors" title="Disconnect Wallet">
                    <Icons.logout className="text-brand-red" />
                 </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;