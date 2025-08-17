import React from 'react';
import { Page, User, ScenarioType } from '../types';
import { Icons } from './Icons';
import SecurityStatus from './SecurityStatus';

interface HeaderProps {
  currentPage: Page;
  user: User;
  onDisconnect: () => void;
  activeScenario: ScenarioType;
  isContingencyMode: boolean;
}

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  marketplace: 'Bond Marketplace',
  portfolio: 'My Portfolio',
  bondDetail: 'Bond Analysis',
  'system-analytics': 'System Analytics',
  'integrations': 'Integrations & API',
  'hardware-acceleration': 'Hardware Acceleration',
  'profile-settings': 'Profile & Settings',
}

const KycStatusIndicator: React.FC<{ status: User['kyc']['status'] }> = ({ status }) => {
    const statusMap = {
        unverified: { text: 'Unverified', icon: <Icons.shield />, color: 'text-brand-red' },
        pending: { text: 'Pending', icon: <Icons.spinner className="animate-spin" />, color: 'text-brand-yellow' },
        verified: { text: 'Verified', icon: <Icons.shieldCheck />, color: 'text-brand-green' },
    };
    const currentStatus = statusMap[status];

    return (
         <div className={`flex items-center space-x-2 ${currentStatus.color}`} title={`KYC Status: ${currentStatus.text}`}>
            {currentStatus.icon}
            <span className="text-sm font-semibold hidden md:inline">{currentStatus.text}</span>
        </div>
    );
}

const UpiAutopayIndicator: React.FC<{ status: User['upiAutopay']['status'] }> = ({ status }) => {
    const statusMap = {
        none: { text: 'Auto Top-up Off', icon: <Icons.upi />, color: 'text-brand-text-secondary' },
        pending: { text: 'Pending', icon: <Icons.spinner className="animate-spin" />, color: 'text-brand-yellow' },
        active: { text: 'Auto Top-up On', icon: <Icons.upi />, color: 'text-brand-green' },
    };
     const currentStatus = statusMap[status];

    return (
         <div className={`flex items-center space-x-2 ${currentStatus.color}`} title={`UPI Auto Top-up: ${currentStatus.text}`}>
            {currentStatus.icon}
            <span className="text-sm font-semibold hidden md:inline">{currentStatus.text}</span>
        </div>
    );
}


const Header: React.FC<HeaderProps> = ({ currentPage, user, onDisconnect, activeScenario, isContingencyMode }) => {

  const formatAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <header className="bg-brand-surface border-b border-brand-border sticky top-0 z-40 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-white">{pageTitles[currentPage]}</h1>
          <div className="flex items-center space-x-4">
             <SecurityStatus activeScenario={activeScenario} isContingencyMode={isContingencyMode} />
             <div className="hidden sm:flex items-center space-x-3 bg-brand-bg border border-brand-border px-3 py-1.5 rounded-lg">
                <KycStatusIndicator status={user.kyc.status} />
                <div className="w-px h-4 bg-brand-border"></div>
                <UpiAutopayIndicator status={user.upiAutopay.status} />
             </div>
             <div className="hidden sm:flex items-center space-x-3 bg-brand-bg border border-brand-border px-3 py-1.5 rounded-lg">
                <Icons.wallet className="text-brand-yellow" />
                <span className="font-mono text-white">₹{user.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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