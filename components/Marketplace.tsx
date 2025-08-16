import React, { useState, useMemo } from 'react';
import { Bond, ViewState, User } from '../types';
import BondCard from './BondCard';
import TradeModal from './TradeModal';
import { Icons } from './Icons';

interface MarketplaceProps {
  navigate: (view: ViewState) => void;
  handleTrade: (bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => void;
  user: User;
  bonds: Bond[];
  addToast: (message: string, type?: 'success' | 'error') => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ navigate, handleTrade, user, bonds, addToast }) => {
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectBondForTrade = (bond: Bond) => {
    setSelectedBond(bond);
  };

  const handleCloseModal = () => {
    setSelectedBond(null);
  };

  const handleViewBondDetails = (bondId: string) => {
    navigate({ page: 'bondDetail', bondId });
  };

  const filteredBonds = useMemo(() => {
    if (!searchTerm) {
      return bonds;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return bonds.filter(bond =>
      bond.name.toLowerCase().includes(lowercasedFilter) ||
      bond.issuer.toLowerCase().includes(lowercasedFilter) ||
      bond.isin.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, bonds]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-brand-text-secondary mt-2">Discover and trade from over {bonds.length} corporate bonds.</p>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.search />
        </div>
        <input
          type="text"
          placeholder="Search by ISIN, Issuer, or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-brand-surface border border-brand-border rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
        />
      </div>

      {filteredBonds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBonds.map(bond => (
            <BondCard 
              key={bond.id} 
              bond={bond} 
              onTrade={handleSelectBondForTrade}
              onViewDetails={handleViewBondDetails}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-16">
            <p className="text-lg text-brand-text-secondary">No bonds match your search criteria.</p>
            <p className="text-brand-text-secondary">Try searching for a different issuer or ISIN.</p>
        </div>
      )}
      
      {selectedBond && <TradeModal bond={selectedBond} onClose={handleCloseModal} handleTrade={handleTrade} user={user} addToast={addToast} />}
    </div>
  );
};

export default Marketplace;