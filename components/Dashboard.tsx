import React, { useState, useEffect, useMemo } from 'react';
import Card from './shared/Card';
import Spinner from './shared/Spinner';
import { generateGeminiAnalysis } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icons } from './Icons';
import { ViewState, Bond, TransactionEvent, User } from '../types';
import MarketIntelligence from './MarketIntelligence';
import WalletAndFunds from './WalletAndFunds';


const marketData = Array.from({ length: 12 }, (_, i) => ({
  name: new Date(0, i).toLocaleString('default', { month: 'short' }),
  value: 1200 + Math.random() * 200 - 100 * Math.sin(i / 2),
}));

const SystemHealthOverview: React.FC<{ backendState: any; navigate: (v: ViewState) => void }> = ({ backendState, navigate }) => {
    const metrics = backendState.metrics;
    const isOk = Object.values(metrics).every((m: any) => m.status === 'Operational');
    const totalTransactions = backendState.transactions.length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {isOk ? <Icons.status.ok /> : <Icons.status.error />}
                    <span className="text-brand-text-secondary">Overall Status</span>
                </div>
                <span className={`text-sm font-medium ${isOk ? 'text-brand-green' : 'text-brand-red'}`}>{isOk ? 'Operational' : 'Issues Detected'}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-brand-text-secondary">API Gateway (req/s)</span>
                <span className="font-mono text-white">{metrics.APIGW.value.toFixed(0)}</span>
            </div>
             <div className="flex items-center justify-between">
                <span className="text-brand-text-secondary">Matching Engine (ops/s)</span>
                <span className="font-mono text-white">{metrics.OrderMatch.value.toLocaleString()}</span>
            </div>
             <div className="flex items-center justify-between">
                <span className="text-brand-text-secondary">Total Transactions</span>
                <span className="font-mono text-white">{totalTransactions}</span>
            </div>
            <button
                onClick={() => navigate({ page: 'system-analytics'})}
                className="w-full text-center bg-brand-bg hover:bg-brand-border text-brand-primary font-semibold py-2 px-4 rounded-md mt-2 transition-colors"
            >
                View System Analytics
            </button>
        </div>
    );
};

const TopMovers: React.FC<{ movers: Bond[], navigate: (v: ViewState) => void }> = ({ movers, navigate }) => {
    const gainers = movers.filter(m => m.dayChange > 0).sort((a,b) => b.dayChange - a.dayChange).slice(0,3);
    const losers = movers.filter(m => m.dayChange < 0).sort((a,b) => a.dayChange - b.dayChange).slice(0,3);

    const MoverRow = ({ bond }: { bond: Bond }) => (
         <button onClick={() => navigate({ page: 'bondDetail', bondId: bond.id })} className="flex justify-between items-center text-left w-full hover:bg-brand-bg p-1 rounded-md">
            <div>
                <p className="font-semibold text-sm text-brand-text">{bond.issuer}</p>
                <p className="text-xs text-brand-text-secondary">{bond.isin}</p>
            </div>
            <span className={`font-mono text-sm font-bold ${bond.dayChange > 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                {bond.dayChange > 0 ? '+' : ''}{bond.dayChange.toFixed(2)}%
            </span>
        </button>
    );

    return (
        <div>
            <div className="mb-4">
                <h4 className="font-semibold text-brand-green mb-2">Top Gainers</h4>
                <div className="space-y-2">
                    {gainers.map(g => <MoverRow key={g.id} bond={g} />)}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-brand-red mb-2">Top Losers</h4>
                 <div className="space-y-2">
                    {losers.map(l => <MoverRow key={l.id} bond={l} />)}
                </div>
            </div>
        </div>
    );
}

interface DashboardProps {
  navigate: (view: ViewState) => void;
  backendState: any;
  topMovers: Bond[];
  user: User;
  onOpenAddFunds: () => void;
  bonds: Bond[];
}


const Dashboard: React.FC<DashboardProps> = ({ navigate, backendState, topMovers, user, onOpenAddFunds, bonds }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [liquidityScore, setLiquidityScore] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const totalVolume = useMemo(() => {
    return backendState.transactions
        .filter((tx: TransactionEvent) => tx.status === 'SUCCESS' && tx.type === 'SETTLEMENT')
        .reduce((sum: number) => sum + (Math.random() * 500000) + 100000, 0); // Simulate some value
  }, [backendState.transactions]);


  useEffect(() => {
    const fetchAllAnalyses = async () => {
      setIsLoading(true);
      try {
        const [generalResult, liquidityResult] = await Promise.all([
          generateGeminiAnalysis('general'),
          generateGeminiAnalysis('liquidity')
        ]);
        setAnalysis(generalResult);
        setLiquidityScore(liquidityResult);
      } catch (error) {
        console.error("Failed to fetch Gemini analysis:", error);
        setAnalysis("Failed to load market analysis. Please try again later.");
        setLiquidityScore("N/A");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAnalyses();
  }, []);
  
  const [score, text] = useMemo(() => {
    if (!liquidityScore) return ['N/A', 'Loading...'];
    const cleanedScore = liquidityScore.replace(/\*/g, '');
    const bracketIndex = cleanedScore.indexOf('(');
    if (bracketIndex !== -1) {
        const scorePart = cleanedScore.substring(0, bracketIndex).trim();
        const textPart = cleanedScore.substring(bracketIndex + 1, cleanedScore.indexOf(')')).trim();
        return [scorePart, textPart];
    }
    return [cleanedScore, ''];
  }, [liquidityScore]);

  const liquidityNumericValue = useMemo(() => {
      if(!score) return 0;
      return parseInt(score.split('/')[0] || '0', 10);
  }, [score]);


  return (
    <div className="space-y-8">
      
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-2">
             <Icons.volume />
             <h3 className="text-lg font-semibold text-brand-text-secondary">Tokenized Volume (Cr)</h3>
          </div>
          <p className="text-3xl font-bold text-white">₹{(totalVolume / 10000000).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-sm text-brand-green">+2.5% vs yesterday</p>
        </Card>
        <Card>
          <div className="flex items-center space-x-3 mb-2">
            <Icons.issues />
            <h3 className="text-lg font-semibold text-brand-text-secondary">Active Issues</h3>
          </div>
          <p className="text-3xl font-bold text-white">{bonds.length.toLocaleString()}</p>
           <p className="text-sm text-brand-text-secondary">+12 new listings</p>
        </Card>
         <Card className="md:col-span-2">
            <WalletAndFunds user={user} onAddFunds={onOpenAddFunds} />
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <h3 className="text-xl font-semibold mb-4">Market Index Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis dataKey="name" stroke="#8B949E" />
              <YAxis stroke="#8B949E" domain={['dataMin - 50', 'dataMax + 50']}/>
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }} />
              <Legend />
              <Line type="monotone" dataKey="value" name="QB Index" stroke="#58A6FF" strokeWidth={2} activeDot={{ r: 8 }} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <div className="flex items-center space-x-3 mb-2">
                  <Icons.liquidity />
                  <h3 className="text-xl font-semibold">Liquidity Score</h3>
                </div>
                {isLoading ? <Spinner /> : (
                  <>
                    <p className="text-4xl font-bold text-white text-center py-2">{score}</p>
                    <p className={`text-sm text-center ${liquidityNumericValue > 70 ? 'text-brand-green' : 'text-brand-yellow'}`}>{text}</p>
                  </>
                )}
            </Card>
            <Card>
                <h3 className="text-xl font-semibold mb-4">Top Movers (24h)</h3>
                <TopMovers movers={topMovers} navigate={navigate} />
            </Card>
        </div>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <div className="flex items-center space-x-2 mb-4">
              <Icons.gemini />
              <h3 className="text-xl font-semibold">Quantum-Bio Analyst</h3>
            </div>
            {isLoading ? <Spinner /> : (
              <div className="gemini-analysis text-brand-text-secondary" dangerouslySetInnerHTML={{ __html: analysis }} />
            )}
          </Card>
           <Card className="lg:col-span-2">
                <MarketIntelligence />
            </Card>
       </div>
    </div>
  );
};

export default Dashboard;