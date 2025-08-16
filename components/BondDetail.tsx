import React, { useState, useMemo } from 'react';
import { ViewState, Bond, User } from '../types';
import { BONDS } from '../constants';
import { generateBondDeepDiveAnalysis } from '../services/geminiService';
import Card from './shared/Card';
import Spinner from './shared/Spinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from './Icons';
import OrderBook from './OrderBook';
import TradeModal from './TradeModal';
import BondProcessVisualizer from './BondProcessVisualizer';


interface BondDetailProps {
  bondId: string;
  navigate: (view: ViewState) => void;
  handleTrade: (bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => void;
  user: User;
  addToast: (message: string, type?: 'success' | 'error') => void;
  backendState: any;
  isContingencyMode: boolean;
}

const generatePriceHistory = (basePrice: number) => {
    let data = [];
    let price = basePrice * (1 + (Math.random() - 0.5) * 0.05);
    for (let i = 30; i > 0; i--) {
        data.push({
            day: `-${i}d`,
            price: parseFloat(price.toFixed(2))
        });
        price *= (1 + (Math.random() - 0.5) * 0.01);
    }
    data.push({day: 'Today', price: basePrice});
    return data;
};

const BondDetail: React.FC<BondDetailProps> = ({ bondId, navigate, handleTrade, user, addToast, backendState, isContingencyMode }) => {
  const [deepDiveAnalysis, setDeepDiveAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const bond = useMemo(() => {
    const staticBond = BONDS.find(b => b.id === bondId);
    return backendState.liveBondData[bondId] || staticBond;
  }, [bondId, backendState.liveBondData]);
  
  if (!bond) {
    return (
      <div>
        <h2 className="text-2xl text-red-500">Bond not found</h2>
        <button onClick={() => navigate({ page: 'marketplace' })} className="text-brand-primary mt-4">
          &larr; Back to Marketplace
        </button>
      </div>
    );
  }
  
  const priceHistory = generatePriceHistory(bond.currentPrice);

  const handleFetchDeepDive = async () => {
    setIsLoading(true);
    setDeepDiveAnalysis(null);
    try {
        const result = await generateBondDeepDiveAnalysis(bond);
        setDeepDiveAnalysis(result);
    } catch (error) {
        console.error("Failed to fetch deep dive analysis:", error);
        setDeepDiveAnalysis("Failed to load issuer analysis. Please try again later.");
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-3xl font-bold text-white">{bond.name}</h2>
            <p className="text-brand-text-secondary">{bond.issuer} / {bond.isin}</p>
        </div>
        <button 
            onClick={() => setIsTradeModalOpen(true)}
            className="bg-brand-primary text-black font-semibold py-2 px-6 rounded-md hover:opacity-90 transition-opacity"
        >
            Trade
        </button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><p className="text-sm text-brand-text-secondary">Market Price</p><p className="text-xl font-bold">₹{bond.currentPrice.toFixed(2)}</p></Card>
        <Card><p className="text-sm text-brand-text-secondary">Coupon</p><p className="text-xl font-bold">{bond.coupon}%</p></Card>
        <Card><p className="text-sm text-brand-text-secondary">Maturity</p><p className="text-xl font-bold">{bond.maturityDate}</p></Card>
        <Card><p className="text-sm text-brand-text-secondary">Credit Rating</p><p className="text-xl font-bold">{bond.creditRating}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Price Performance & Liquidity</h3>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <p className="text-center text-sm text-brand-text-secondary mb-2">30-Day Price History</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={priceHistory}>
                            <defs>
                                <linearGradient id="colorPriceDetail" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#58A6FF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                            <XAxis dataKey="day" stroke="#8B949E" fontSize={12} />
                            <YAxis stroke="#8B949E" domain={['dataMin - 2', 'dataMax + 2']} fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}/>
                            <Area type="monotone" dataKey="price" stroke="#58A6FF" fill="url(#colorPriceDetail)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-center">Liquidity Metrics</h4>
                    <div className="bg-brand-bg p-4 rounded-md text-center">
                        <p className="text-brand-text-secondary">24h Trading Volume</p>
                        <p className="text-xl font-bold text-white">₹{bond.volume.toLocaleString()}</p>
                    </div>
                    <div className="bg-brand-bg p-4 rounded-md text-center">
                        <p className="text-brand-text-secondary">Bid-Ask Spread</p>
                        <p className="text-xl font-bold text-white">{bond.bidAskSpread.toFixed(3)}</p>
                    </div>
                </div>
            </div>
          </Card>
          <Card>
             <h3 className="text-xl font-semibold mb-2">Live Order Book</h3>
             <p className="text-xs text-center text-brand-text-secondary mb-2">
                {isContingencyMode ? 'Standard Order Matching' : 'Liquidity optimized by Swarm Intelligence'}
             </p>
             <OrderBook currentPrice={bond.currentPrice}/>
          </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold mb-2">Backend Transparency</h3>
        <p className="text-sm text-brand-text-secondary mb-4">
            This visualizer shows the real-time status of the backend services involved in processing a trade for this bond. Status changes are influenced by the scenarios in the <button onClick={() => navigate({page: 'system-analytics'})} className="text-brand-primary hover:underline">System Analytics</button> dashboard.
        </p>
        <BondProcessVisualizer backendState={backendState} />
      </Card>
      
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Icons.gemini />
          <h3 className="text-xl font-semibold">{isContingencyMode ? 'Standard Issuer Analysis' : 'Gemini Issuer Deep Dive'}</h3>
        </div>
        {isContingencyMode ? (
             <div className="text-center py-8 bg-brand-bg rounded-lg">
                <Icons.zap className="h-12 w-12 mx-auto text-brand-yellow mb-2" />
                <h4 className="text-lg font-semibold text-brand-yellow">Feature Unavailable in Standard Mode</h4>
                <p className="text-brand-text-secondary mt-1">Advanced AI analysis requires a connection to the Gemini API, which is currently bypassed.</p>
            </div>
        ) : isLoading ? <Spinner /> : deepDiveAnalysis ? (
            <div className="gemini-analysis" dangerouslySetInnerHTML={{ __html: deepDiveAnalysis }} />
        ) : (
          <div className="text-center py-8">
            <p className="mb-4 text-brand-text-secondary">Get a detailed, AI-generated report on the issuer's profile, financial health, and recent news.</p>
            <button onClick={handleFetchDeepDive} className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity flex items-center space-x-2 mx-auto">
              {isLoading ? <><Icons.spinner className="animate-spin" /><span>Generating...</span></> : <span>Generate Issuer Report</span>}
            </button>
          </div>
        )}
      </Card>

       {isTradeModalOpen && <TradeModal bond={bond} onClose={() => setIsTradeModalOpen(false)} handleTrade={handleTrade} user={user} addToast={addToast} isContingencyMode={isContingencyMode} />}
    </div>
  );
};

export default BondDetail;