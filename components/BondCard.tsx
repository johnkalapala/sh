import React from 'react';
import { Bond } from '../types';
import Card from './shared/Card';

interface BondCardProps {
  bond: Bond;
  onTrade: (bond: Bond) => void;
  onViewDetails: (bondId: string) => void;
}

const RatingBadge: React.FC<{ rating: string }> = ({ rating }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-bold rounded-full";
    let colorClasses = "";
    switch (rating) {
        case 'AAA': colorClasses = 'bg-green-800 text-green-200'; break;
        case 'AA+':
        case 'AA': colorClasses = 'bg-blue-800 text-blue-200'; break;
        case 'A+':
        case 'A': colorClasses = 'bg-indigo-800 text-indigo-200'; break;
        default: colorClasses = 'bg-gray-700 text-gray-200'; break;
    }
    return <span className={`${baseClasses} ${colorClasses}`}>{rating}</span>
}

const BondCard: React.FC<BondCardProps> = ({ bond, onTrade, onViewDetails }) => {
  return (
    <Card className="flex flex-col justify-between transition-all duration-300 hover:border-brand-primary hover:shadow-2xl">
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
                <p className="text-brand-text-secondary">AI Fair Value</p>
                <p className="font-semibold text-white">₹{bond.aiFairValue.toFixed(2)}</p>
            </div>
        </div>
      </div>
      <button 
        onClick={() => onTrade(bond)}
        className="w-full bg-brand-secondary text-white py-2 rounded-md font-semibold hover:bg-brand-primary transition-colors"
      >
        Trade
      </button>
    </Card>
  );
};

export default BondCard;