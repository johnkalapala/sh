import React, { useState, useMemo } from 'react';
import { Bond, User } from '../types';
import Spinner from './shared/Spinner';
import { generateGeminiAnalysis } from '../services/geminiService';
import { Icons } from './Icons';

interface TradeModalProps {
  bond: Bond;
  onClose: () => void;
  handleTrade: (bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => void;
  user: User;
  addToast: (message: string, type?: 'success' | 'error') => void;
}


const TradeModal: React.FC<TradeModalProps> = ({ bond, onClose, handleTrade, user }) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState(100000); // Default 1 Lakh
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
  const units = useMemo(() => {
    return amount / bond.currentPrice;
  }, [amount, bond.currentPrice]);

  const handleAskGemini = async () => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    try {
        const result = await generateGeminiAnalysis('bond', bond);
        setAnalysis(result);
    } catch (err) {
        setAnalysis("Error fetching analysis.");
    } finally {
        setIsLoadingAnalysis(false);
    }
  }
  
  const onExecuteTrade = () => {
    if (amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    
    if (tradeType === 'buy' && amount > user.balance) {
        alert("Insufficient funds.");
        return;
    }
    
    // In a real scenario, we would check if the user holds enough units to sell.
    // For this prototype, we will assume they do.
    
    handleTrade(bond, units, tradeType);
    onClose();
  };
  
  const insufficientFunds = tradeType === 'buy' && amount > user.balance;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-surface rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-brand-border shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-white text-2xl font-bold">&times;</button>
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Trade</h2>
            <p className="text-brand-text-secondary">{bond.name}</p>
          </div>
          
           <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-brand-bg p-4 rounded-lg text-center">
                    <p className="text-sm text-brand-text-secondary">Market Price</p>
                    <p className="text-2xl font-mono font-bold text-white">₹{bond.currentPrice.toFixed(2)}</p>
                </div>
                 <div className="bg-brand-bg p-4 rounded-lg text-center">
                    <p className="text-sm text-brand-text-secondary">AI Fair Value</p>
                    <p className="text-2xl font-mono font-bold text-brand-primary">₹{bond.aiFairValue.toFixed(2)}</p>
                </div>
           </div>

           <div className="bg-brand-bg rounded-lg p-6">
             <div className="flex bg-brand-surface rounded-md p-1 mb-4">
                <button onClick={() => setTradeType('buy')} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${tradeType === 'buy' ? 'bg-brand-green text-white' : 'text-brand-text-secondary hover:bg-brand-border'}`}>Buy</button>
                <button onClick={() => setTradeType('sell')} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${tradeType === 'sell' ? 'bg-brand-red text-white' : 'text-brand-text-secondary hover:bg-brand-border'}`}>Sell</button>
            </div>
            
            <div>
                <label className="text-brand-text-secondary text-sm">Amount to {tradeType}</label>
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

            <div className="mt-4 space-y-2 text-sm text-brand-text-secondary">
                <div className="flex justify-between"><span>Units to {tradeType}:</span><span className="font-mono text-white">{units.toFixed(4)}</span></div>
                 <div className="flex justify-between"><span>Available Balance:</span><span className="font-mono text-white">₹{user.balance.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold"><span className="text-brand-text">New Balance after Trade:</span><span className={`font-mono ${insufficientFunds ? 'text-brand-red' : 'text-white'}`}>₹{(user.balance + (tradeType === 'sell' ? amount : -amount)).toLocaleString('en-IN')}</span></div>
            </div>
             {insufficientFunds && <p className="text-brand-red text-sm text-center mt-3">You do not have enough funds for this purchase.</p>}

            <button 
                onClick={onExecuteTrade} 
                disabled={insufficientFunds}
                className={`w-full p-3 mt-4 rounded-md font-bold text-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${tradeType === 'buy' ? 'bg-brand-green hover:bg-green-700' : 'bg-brand-red hover:bg-red-700'}`}
            >
                Confirm {tradeType === 'buy' ? 'Buy' : 'Sell'} Order
            </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
