import React, { useState } from 'react';
import { Icons } from './Icons';

interface AddFundsModalProps {
  onClose: () => void;
  onAddFunds: (amount: number) => void;
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({ onClose, onAddFunds }) => {
  const [amount, setAmount] = useState(100000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    if (amount <= 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
        onAddFunds(amount);
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-surface rounded-lg w-full max-w-md border border-brand-border shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-white text-2xl font-bold">&times;</button>
        <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Add Funds to Wallet</h2>
            
            <div className="bg-brand-bg rounded-lg p-6">
                 <div>
                    <label className="text-brand-text-secondary text-sm">Amount to Add</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-text-secondary">₹</span>
                        <input 
                            type="number"
                            step="1000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-brand-surface border border-brand-border rounded-md p-3 pl-8 font-mono text-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-brand-text-secondary mb-2">Select Payment Method</p>
                    <div className="flex space-x-2">
                        <button className="flex-1 text-center p-3 border-2 border-brand-primary bg-brand-primary/20 rounded-md">UPI</button>
                        <button className="flex-1 text-center p-3 border border-brand-border hover:bg-brand-border rounded-md">Net Banking</button>
                    </div>
                </div>

                <button 
                    onClick={handleConfirm} 
                    disabled={amount <= 0 || isSubmitting}
                    className="w-full p-3 mt-6 rounded-md font-bold text-lg bg-brand-green text-black hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2"
                >
                    {isSubmitting ? <><Icons.spinner className="animate-spin"/> <span>Processing...</span></> : <span>Confirm & Pay ₹{amount.toLocaleString()}</span>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddFundsModal;
