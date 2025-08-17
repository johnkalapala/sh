import React from 'react';
import { Icons } from './Icons';

interface LoginModalProps {
  onConnect: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onConnect }) => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-lg shadow-2xl p-8 text-center">
        <div className="mx-auto mb-6 h-16 w-16">
          <Icons.logo />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to QuantumBond</h1>
        <p className="text-brand-text-secondary mb-8">Solving bond market illiquidity through AI-driven tokenization and secure, fractional investing.</p>
        
        <button 
          onClick={onConnect}
          className="w-full bg-brand-primary text-black font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center space-x-3 text-lg"
        >
          <Icons.wallet />
          <span>Connect Wallet (Simulation)</span>
        </button>
        <div className="flex items-center justify-center space-x-2 text-xs text-brand-text-secondary mt-6">
          <Icons.shield className="h-4 w-4 text-brand-primary" />
          <span>Secure Settlement via Hedera Hashgraph DLT</span>
        </div>
        <p className="text-xs text-brand-text-secondary mt-2">
          This is a prototype. The wallet connection is simulated and does not use real funds.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;