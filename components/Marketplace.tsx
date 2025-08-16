import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Bond, ViewState, User, CreditRating } from '../types';
import BondCard from './BondCard';
import TradeModal from './TradeModal';
import { Icons } from './Icons';
import Card from './shared/Card';

interface MarketplaceProps {
  navigate: (view: ViewState) => void;
  handleTrade: (bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => void;
  user: User;
  bonds: Bond[];
  addToast: (message: string, type?: 'success' | 'error') => void;
  isContingencyMode: boolean;
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

const getColumnCount = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1280) return 4; // xl
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 768) return 2;  // md
    return 1;
};

const Marketplace: React.FC<MarketplaceProps> = ({ navigate, handleTrade, user, bonds, addToast, isContingencyMode }) => {
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  const filteredBonds = useMemo(() => {
    let result = bonds;
    
    if (debouncedSearchTerm) {
      const lowercasedFilter = debouncedSearchTerm.toLowerCase();
      result = result.filter(bond =>
        bond.name.toLowerCase().includes(lowercasedFilter) ||
        bond.issuer.toLowerCase().includes(lowercasedFilter) ||
        bond.isin.toLowerCase().includes(lowercasedFilter)
      );
    }
    
    if (activeFilters.ratings.length > 0) {
      result = result.filter(bond => activeFilters.ratings.includes(bond.creditRating));
    }
    result = result.filter(bond => bond.coupon >= activeFilters.couponRange[0] && bond.coupon <= activeFilters.couponRange[1]);
    result = result.filter(bond => {
        const maturityYear = new Date(bond.maturityDate).getFullYear();
        return maturityYear >= activeFilters.maturityRange[0] && maturityYear <= activeFilters.maturityRange[1];
    });

    return result;
  }, [debouncedSearchTerm, bonds, activeFilters]);

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


  // --- Virtualization Logic ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [columnCount, setColumnCount] = useState(getColumnCount());

  useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemHeight = 300; // Estimated height of a BondCard with gaps
  const containerHeight = 800; // Fixed height for the viewport
  const overscan = 5;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) * columnCount - (overscan * columnCount));
  const endIndex = Math.min(filteredBonds.length, Math.ceil((scrollTop + containerHeight) / itemHeight) * columnCount + (overscan * columnCount));
  
  const virtualItems = useMemo(() => {
    const items = [];
    const itemWidth = 100 / columnCount;

    for(let i = startIndex; i < endIndex; i++) {
        const bond = filteredBonds[i];
        if (!bond) continue;

        const rowIndex = Math.floor(i / columnCount);
        const colIndex = i % columnCount;
        
        items.push(
            <div key={bond.id} style={{ 
                position: 'absolute', 
                top: `${rowIndex * itemHeight}px`, 
                left: `${colIndex * itemWidth}%`,
                width: `${itemWidth}%`,
                padding: '0.75rem'
            }}>
                 <BondCard 
                    bond={bond} 
                    onTrade={handleSelectBondForTrade}
                    onViewDetails={handleViewBondDetails}
                    isContingencyMode={isContingencyMode}
                  />
            </div>
        );
    }
    return items;
  }, [startIndex, endIndex, filteredBonds, columnCount, isContingencyMode, handleSelectBondForTrade, handleViewBondDetails]);


  return (
    <div className="space-y-6">
      <div>
        <p className="text-brand-text-secondary mt-2">Discover, filter, and trade from {bonds.length.toLocaleString()} corporate bonds.</p>
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
        Showing {filteredBonds.length.toLocaleString()} of {bonds.length.toLocaleString()} bonds
      </div>

      {filteredBonds.length > 0 ? (
        <div 
          ref={containerRef}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          style={{ height: `${containerHeight}px`, overflowY: 'auto', position: 'relative' }}
          className="-mx-3"
        >
          <div style={{ height: `${Math.ceil(filteredBonds.length / columnCount) * itemHeight}px`, position: 'relative' }}>
            {virtualItems}
          </div>
        </div>
      ) : (
         <div className="text-center py-16">
            <p className="text-lg text-brand-text-secondary">No bonds match your search criteria.</p>
            <p className="text-brand-text-secondary">Try adjusting your search or clearing some filters.</p>
        </div>
      )}
      
      {selectedBond && <TradeModal bond={selectedBond} onClose={handleCloseModal} handleTrade={handleTrade} user={user} addToast={addToast} isContingencyMode={isContingencyMode} />}
    </div>
  );
};

export default Marketplace;