import React from 'react';
import { User } from '../types';
import { Icons } from './Icons';

interface WalletAndFundsProps {
    user: User;
    onAddFunds: () => void;
}

const WalletAndFunds: React.FC<WalletAndFundsProps> = ({ user, onAddFunds }) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <Icons.wallet />
                    <h3 className="text-lg font-semibold text-brand-text-secondary">Wallet Balance</h3>
                </div>
                <button
                    onClick={onAddFunds}
                    className="text-sm bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-primary font-semibold py-1 px-3 rounded-md transition-colors"
                >
                    Add Funds
                </button>
            </div>
            <p className="text-3xl font-bold text-white">₹{user.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-brand-text-secondary">Available for trading</p>
        </div>
    );
};

export default WalletAndFunds;
