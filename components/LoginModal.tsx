import React from 'react';
import { Icons } from './Icons';

interface LoginModalProps {
  onConnect: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onConnect }) => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-lg shadow-2xl p-8 text-center">
        <div className="mx-auto mb-6 h-16 w-16">
          <Icons.logo />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to QuantumBond</h1>
        <p className="text-brand-text-secondary mb-8">The next-generation platform for corporate bond trading, inspired by quantum and biological systems.</p>
        
        <button 
          onClick={onConnect}
          className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-all duration-300 flex items-center justify-center space-x-3 text-lg"
        >
          <Icons.wallet />
          <span>Connect Wallet</span>
        </button>
        <p className="text-xs text-brand-text-secondary mt-6">
          By connecting your wallet, you agree to our Terms of Service. This is a prototype and does not use real funds.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
