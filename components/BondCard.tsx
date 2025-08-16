import React from 'react';
import { Bond } from '../types';
import Card from './shared/Card';

interface BondCardProps {
  bond: Bond;
  onTrade: (bond: Bond) => void;
  onViewDetails: (bondId: string) => void;
  isContingencyMode: boolean;
}

const RatingBadge: React.FC<{ rating: string }> = ({ rating }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-bold rounded-full border";
    let colorClasses = "";
    switch (rating) {
        case 'AAA': colorClasses = 'bg-green-500/10 border-green-500 text-green-400'; break;
        case 'AA+':
        case 'AA': colorClasses = 'bg-blue-500/10 border-blue-500 text-blue-400'; break;
        case 'A+':
        case 'A': colorClasses = 'bg-yellow-500/10 border-yellow-500 text-yellow-400'; break;
        default: colorClasses = 'bg-gray-500/10 border-gray-500 text-gray-400'; break;
    }
    return <span className={`${baseClasses} ${colorClasses}`}>{rating}</span>
}

const BondCard: React.FC<BondCardProps> = ({ bond, onTrade, onViewDetails, isContingencyMode }) => {
  const fairValue = isContingencyMode ? bond.standardFairValue : bond.aiFairValue;
  const fairValueLabel = isContingencyMode ? 'Standard Fair Value' : 'Quantum Fair Value';

  return (
    <Card className="flex flex-col justify-between transition-all duration-300 hover:border-brand-primary hover:shadow-2xl hover:-translate-y-1 h-[280px]">
      <div>
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white leading-tight pr-2">{bond.issuer}</h3>
            <RatingBadge rating={bond.creditRating} />
        </div>
        <button 
            onClick={() => onViewDetails(bond.id)} 
            className="text-left text-sm text-brand-text-secondary mb-4 hover:text-brand-primary transition-colors"
        >
            {bond.name}
        </button>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
            <div>
                <p className="text-brand-text-secondary">Coupon</p>
                <p className="font-semibold text-white">{bond.coupon.toFixed(2)}%</p>
            </div>
            <div>
                <p className="text-brand-text-secondary">Maturity</p>
                <p className="font-semibold text-white">{new Date(bond.maturityDate).getFullYear()}</p>
            </div>
             <div>
                <p className="text-brand-text-secondary">Price</p>
                <p className="font-semibold text-white">₹{bond.currentPrice.toFixed(2)}</p>
            </div>
            <div>
                <p className={`text-brand-text-secondary ${isContingencyMode ? 'text-yellow-400' : ''}`}>{fairValueLabel}</p>
                <p className="font-semibold text-white">₹{fairValue.toFixed(2)}</p>
            </div>
        </div>
      </div>
      <button 
        onClick={() => onTrade(bond)}
        className="w-full bg-brand-primary text-black py-2 rounded-md font-semibold hover:opacity-90 transition-opacity"
      >
        Trade
      </button>
    </Card>
  );
};

export default BondCard;