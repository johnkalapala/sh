import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import Spinner from './shared/Spinner';
import { generateGeminiAnalysis } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BONDS } from '../constants';
import { Icons } from './Icons';
import { ViewState } from '../types';
import LiveTransactionFeed from './analytics/LiveTransactionFeed';

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
                <span className="font-mono text-white">{metrics.OrderMatch.value.toFixed(0)}</span>
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

interface DashboardProps {
  navigate: (view: ViewState) => void;
  backendState: any;
}


const Dashboard: React.FC<DashboardProps> = ({ navigate, backendState }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [entropy, setEntropy] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllAnalyses = async () => {
      setIsLoading(true);
      try {
        const [generalResult, entropyResult] = await Promise.all([
          generateGeminiAnalysis('general'),
          generateGeminiAnalysis('entropy')
        ]);
        setAnalysis(generalResult);
        setEntropy(entropyResult);
      } catch (error) {
        console.error("Failed to fetch Gemini analysis:", error);
        setAnalysis("Failed to load market analysis. Please try again later.");
        setEntropy("N/A");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAnalyses();
  }, []);
  
  const [entropyScore, entropyText] = entropy.split(' - ');
  const entropyValue = parseInt(entropyScore?.split('/')[0] || '0');


  return (
    <div className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-2">
             <Icons.volume />
             <h3 className="text-lg font-semibold text-brand-text-secondary">Market Volume (Cr)</h3>
          </div>
          <p className="text-3xl font-bold text-white">₹{backendState.metrics.Settlement.value.toLocaleString('en-IN')}</p>
          <p className="text-sm text-brand-green">+2.5% vs yesterday</p>
        </Card>
        <Card>
          <div className="flex items-center space-x-3 mb-2">
            <Icons.issues />
            <h3 className="text-lg font-semibold text-brand-text-secondary">Active Issues</h3>
          </div>
          <p className="text-3xl font-bold text-white">{BONDS.length.toLocaleString()}</p>
           <p className="text-sm text-brand-text-secondary">+12 new listings</p>
        </Card>
        <Card>
           <div className="flex items-center space-x-3 mb-2">
            <Icons.yield />
            <h3 className="text-lg font-semibold text-brand-text-secondary">Average Yield</h3>
           </div>
          <p className="text-3xl font-bold text-white">7.82%</p>
          <p className="text-sm text-brand-red">-0.05% change</p>
        </Card>
         <Card>
            <div className="flex items-center space-x-3 mb-2">
              <Icons.entropy />
              <h3 className="text-lg font-semibold text-brand-text-secondary">Market Health</h3>
            </div>
            {isLoading ? <Spinner /> : (
              <>
                <p className="text-3xl font-bold text-white">{entropyScore}</p>
                <p className={`text-sm ${entropyValue > 60 ? 'text-brand-green' : 'text-brand-yellow'}`}>{entropyText}</p>
              </>
            )}
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
                <h3 className="text-xl font-semibold mb-4">System Health Overview</h3>
                <SystemHealthOverview backendState={backendState} navigate={navigate} />
            </Card>
            <Card>
                <h3 className="text-xl font-semibold mb-4">Live Transaction Feed</h3>
                <LiveTransactionFeed transactions={backendState.transactions} limit={5} />
            </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Icons.gemini />
          <h3 className="text-xl font-semibold">Gemini Market Analyst</h3>
        </div>
        {isLoading ? <Spinner /> : (
          <div className="gemini-analysis text-brand-text-secondary" dangerouslySetInnerHTML={{ __html: analysis }} />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
