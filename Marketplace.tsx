
import React, { useState, useEffect, useRef } from 'react';
import { Bond, ViewState, User, CreditRating } from '../types';
import BondCard from './BondCard';
import TradeModal from './TradeModal';
import { Icons } from './Icons';
import Card from './shared/Card';
import Spinner from './components/shared/Spinner';

interface MarketplaceProps {
  navigate: (view: ViewState) => void;
  handleTrade: (bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => void;
  user: User;
  backendState: any;
  addToast: (message: string, type?: 'success' | 'error') => void;
  searchBonds: (term: string) => void;
  setBondFilters: (filters: any) => void;
  pagination: { currentPage: number; totalPages: number; totalItems: number };
  setPagination: (updater: (prev: { currentPage: number; totalPages: number; totalItems: number }) => { currentPage: number; totalPages: number; totalItems: number }) => void;
  isLoading: boolean;
}

const ALL_RATINGS = Object.values(CreditRating);
const MIN_COUPON = 6;
const MAX_COUPON = 11;
const MIN_MATURITY = 2026;
const MAX_MATURITY = 2040;

const defaultFilters = {
  ratings: [] as CreditRating[],
  couponRange: [MIN_COUPON, MAX_COUPON] as [number, number],
  maturityRange: [MIN_MATURITY, MAX_MATURITY] as [number, number],
};

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const Marketplace: React.FC<MarketplaceProps> = ({ 
  navigate, handleTrade, user, backendState, addToast, 
  searchBonds, setBondFilters, pagination, setPagination, isLoading
}) => {
  const { bonds, isContingencyMode, isCircuitBreakerTripped, togglePriceSimulation, isPriceSimulationEnabled } = backendState;
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    searchBonds(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchBonds]);

  useEffect(() => {
    setBondFilters(activeFilters);
  }, [activeFilters, setBondFilters]);

  const handleSelectBondForTrade = (bond: Bond) => {
    setSelectedBond(bond);
  };

  const handleCloseModal = () => {
    setSelectedBond(null);
  };

  const handleViewBondDetails = (bondId: string) => {
    navigate({ page: 'bondDetail', bondId });
  };
  
  const isFiltersDefault = JSON.stringify(activeFilters) === JSON.stringify(defaultFilters);

  // --- Filter Logic ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleFilter = () => {
    if(!isFilterOpen) setTempFilters(activeFilters);
    setIsFilterOpen(!isFilterOpen);
  };
  const handleApplyFilters = () => {
    setActiveFilters(tempFilters);
    setIsFilterOpen(false);
  };
  const handleClearFilters = () => {
    setTempFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setIsFilterOpen(false);
  };
  const handleRatingToggle = (rating: CreditRating) => setTempFilters(prev => ({ ...prev, ratings: prev.ratings.includes(rating) ? prev.ratings.filter(r => r !== rating) : [...prev.ratings, rating] }));
  const removeRatingFilter = (rating: CreditRating) => setActiveFilters(prev => ({ ...prev, ratings: prev.ratings.filter(r => r !== rating)}));
  const resetCouponFilter = () => setActiveFilters(prev => ({...prev, couponRange: defaultFilters.couponRange}));
  const resetMaturityFilter = () => setActiveFilters(prev => ({...prev, maturityRange: defaultFilters.maturityRange}));


  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }));
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
        return <div className="py-16"><Spinner /></div>;
    }
    
    if (bonds.length > 0) {
        return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bonds.map((bond: Bond) => (
                  <BondCard
                    key={bond.id}
                    bond={bond}
                    onTrade={handleSelectBondForTrade}
                    onViewDetails={handleViewBondDetails}
                    isContingencyMode={isContingencyMode}
                    isCircuitBreakerTripped={isCircuitBreakerTripped}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                  <button onClick={handlePrevPage} disabled={pagination.currentPage === 1} className="px-4 py-2 bg-brand-surface border border-brand-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                  </button>
                  <span className="text-sm text-brand-text-secondary">
                      Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button onClick={handleNextPage} disabled={pagination.currentPage === pagination.totalPages} className="px-4 py-2 bg-brand-surface border border-brand-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                  </button>
              </div>
            </>
        )
    }
    
    return (
        <div className="text-center py-16">
            {pagination.totalItems > 0 ? (
                <p className="text-lg text-brand-text-secondary">No bonds match your search criteria.</p>
            ) : (
                <div className="text-center py-16">
                    <Icons.database className="h-12 w-12 mx-auto text-brand-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold text-white">No Market Data Loaded</h3>
                    <p className="text-brand-text-secondary mt-2">Please upload a bond dataset from the Integrations page to begin.</p>
                </div>
            )}
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-brand-text-secondary mt-2">Discover, filter, and trade from {(pagination.totalItems || 0).toLocaleString()} tokenized corporate bonds.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
            <span className="text-brand-text-secondary">Live Price Simulation</span>
            <button
                onClick={togglePriceSimulation}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isPriceSimulationEnabled ? 'bg-brand-primary' : 'bg-brand-surface'}`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isPriceSimulationEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
        </div>
      </div>
      
      <div className="relative" ref={filterRef}>
        <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
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
            <button 
                onClick={handleToggleFilter}
                className={`relative px-4 py-3 bg-brand-surface border border-brand-border rounded-lg text-white hover:bg-brand-border transition-colors ${!isFiltersDefault ? 'border-brand-primary' : ''}`}
                title="Filter Bonds"
            >
                <Icons.filter />
                {!isFiltersDefault && <span className="absolute -top-1 -right-1 h-3 w-3 bg-brand-primary rounded-full border-2 border-brand-surface"></span>}
            </button>
        </div>
        {isFilterOpen && (
            <Card className="absolute top-full right-0 mt-2 z-30 w-full lg:w-[700px] p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2">Credit Rating</h4>
                        <div className="space-y-1">
                            {ALL_RATINGS.map(rating => (
                                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={tempFilters.ratings.includes(rating)} onChange={() => handleRatingToggle(rating)} className="form-checkbox bg-brand-bg border-brand-border text-brand-primary focus:ring-brand-primary" />
                                    <span>{rating}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Coupon Rate (%)</h4>
                        <div className="space-y-2">
                            <label className="block text-sm">Min: {tempFilters.couponRange[0].toFixed(1)}%</label>
                            <input type="range" min={MIN_COUPON} max={MAX_COUPON} step="0.1" value={tempFilters.couponRange[0]} onChange={e => setTempFilters(p => ({...p, couponRange: [Number(e.target.value), p.couponRange[1]]}))} className="w-full"/>
                            <label className="block text-sm">Max: {tempFilters.couponRange[1].toFixed(1)}%</label>
                            <input type="range" min={MIN_COUPON} max={MAX_COUPON} step="0.1" value={tempFilters.couponRange[1]} onChange={e => setTempFilters(p => ({...p, couponRange: [p.couponRange[0], Number(e.target.value)]}))} className="w-full"/>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Maturity Year</h4>
                        <div className="space-y-2">
                           <label className="block text-sm">From: {tempFilters.maturityRange[0]}</label>
                           <input type="range" min={MIN_MATURITY} max={MAX_MATURITY} value={tempFilters.maturityRange[0]} onChange={e => setTempFilters(p => ({...p, maturityRange: [Number(e.target.value), p.maturityRange[1]]}))} className="w-full"/>
                           <label className="block text-sm">To: {tempFilters.maturityRange[1]}</label>
                           <input type="range" min={MIN_MATURITY} max={MAX_MATURITY} value={tempFilters.maturityRange[1]} onChange={e => setTempFilters(p => ({...p, maturityRange: [p.maturityRange[0], Number(e.target.value)]}))} className="w-full"/>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-brand-border">
                    <button onClick={handleClearFilters} className="px-4 py-2 bg-brand-bg border border-brand-border rounded-md text-sm font-medium text-brand-text hover:bg-brand-border">Clear All</button>
                    <button onClick={handleApplyFilters} className="px-4 py-2 bg-brand-primary text-black font-semibold rounded-md text-sm hover:opacity-90">Apply Filters</button>
                 </div>
            </Card>
        )}
      </div>
      
       {!isFiltersDefault && (
        <div className="flex items-center flex-wrap gap-2 text-sm">
            <span className="text-brand-text-secondary">Active Filters:</span>
            {activeFilters.ratings.map(r => (
                 <span key={r} className="flex items-center bg-brand-surface border border-brand-border rounded-full px-2 py-1">
                    {r}
                    <button onClick={() => removeRatingFilter(r)} className="ml-1 text-brand-text-secondary hover:text-white"><Icons.close className="h-4 w-4" /></button>
                 </span>
            ))}
             { (activeFilters.couponRange[0] > MIN_COUPON || activeFilters.couponRange[1] < MAX_COUPON) &&
                 <span className="flex items-center bg-brand-surface border border-brand-border rounded-full px-2 py-1">
                    {activeFilters.couponRange[0]}% - {activeFilters.couponRange[1]}%
                    <button onClick={resetCouponFilter} className="ml-1 text-brand-text-secondary hover:text-white"><Icons.close className="h-4 w-4" /></button>
                 </span>
            }
            { (activeFilters.maturityRange[0] > MIN_MATURITY || activeFilters.maturityRange[1] < MAX_MATURITY) &&
                 <span className="flex items-center bg-brand-surface border border-brand-border rounded-full px-2 py-1">
                    {activeFilters.maturityRange[0]} - {activeFilters.maturityRange[1]}
                    <button onClick={resetMaturityFilter} className="ml-1 text-brand-text-secondary hover:text-white"><Icons.close className="h-4 w-4" /></button>
                 </span>
            }
        </div>
      )}
      <div className="text-right text-sm text-brand-text-secondary pr-2">
        Showing {bonds.length > 0 ? bonds.length : '0'} of {pagination.totalItems.toLocaleString()} bonds
      </div>

      {renderContent()}
      
      {selectedBond && <TradeModal bond={selectedBond} onClose={handleCloseModal} handleTrade={handleTrade} user={user} addToast={addToast} isContingencyMode={isContingencyMode} isCircuitBreakerTripped={isCircuitBreakerTripped} />}
    </div>
  );
};

export default Marketplace;
