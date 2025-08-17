import React, { useState } from 'react';
import Card from './shared/Card';
import { PortfolioHolding, ViewState, User, Bond } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Icons } from './Icons';
import backendApiService from '../services/backendApiService';
import WalletAndFunds from './WalletAndFunds';

const COLORS = ['#f59e0b', '#d97706', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#3b82f6', '#a1a1aa'];


interface PortfolioProps {
    userPortfolio: PortfolioHolding[];
    navigate: (view: ViewState) => void;
    user: User;
    onOpenAddFunds: () => void;
    backendState: any;
}

const Portfolio: React.FC<PortfolioProps> = ({ userPortfolio, navigate, user, onOpenAddFunds, backendState }) => {
    const { isContingencyMode, bonds } = backendState;
    const [riskProfile, setRiskProfile] = useState('balanced');
    const [objective, setObjective] = useState('balanced');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<any[] | null>(null);
    const [optimizationAnalysis, setOptimizationAnalysis] = useState<string | null>(null);

    const portfolioBonds = userPortfolio.map(holding => {
        const bondDetails = bonds.find((b: Bond) => b.id === holding.bondId);
        return { ...holding, ...bondDetails };
    });

    const holdingsValue = portfolioBonds.reduce((acc, holding) => {
        return acc + (holding.quantity * (holding.currentPrice || 0));
    }, 0);
    
    const totalValue = holdingsValue + user.walletBalance;

    const portfolioChartData = [
        ...portfolioBonds.map(holding => ({
            name: holding.issuer || 'Unknown',
            value: holding.quantity * (holding.currentPrice || 0)
        })),
        { name: 'Wallet Balance', value: user.walletBalance }
    ];
    
    const handleOptimize = async () => {
        setIsOptimizing(true);
        setOptimizedData(null);
        setOptimizationAnalysis(null);

        // This part is for the chart
        const baseAllocations = {
            conservative: [60, 30, 10],
            balanced: [40, 40, 20],
            aggressive: [20, 40, 40]
        };
        const allocation = baseAllocations[riskProfile as keyof typeof baseAllocations];
        const newOptimizedData = [
            { name: 'High-Grade (AAA)', value: allocation[0] },
            { name: 'Mid-Grade (AA)', value: allocation[1] },
            { name: 'Growth (A/BBB)', value: allocation[2] },
        ];
        
        try {
            const analysisResult = await backendApiService.getPortfolioAnalysis();
            setOptimizationAnalysis(analysisResult);
        } catch (error) {
            console.error("Failed to fetch backend analysis:", error);
            setOptimizationAnalysis("<p>Error: Could not generate portfolio analysis at this time.</p>");
        } finally {
            setOptimizedData(newOptimizedData);
            setIsOptimizing(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-2">Holdings</h3>
                     <div className="py-2 grid grid-cols-4 gap-4 text-sm text-brand-text-secondary font-semibold border-b border-brand-border">
                        <p className="col-span-2">Bond</p>
                        <p className="text-right">Quantity</p>
                        <p className="text-right">Market Value</p>
                    </div>
                    {portfolioBonds.length > 0 ? (
                        <div className="divide-y divide-brand-border">
                            {portfolioBonds.map(holding => (
                                holding.id ? (
                                    <div key={holding.id} className="py-3 grid grid-cols-4 gap-4 items-center">
                                        <button 
                                            onClick={() => navigate({ page: 'bondDetail', bondId: holding.id })}
                                            className="font-semibold col-span-2 text-left hover:text-brand-primary transition-colors"
                                        >
                                            {holding.name}
                                        </button>
                                        <p className="text-right font-mono">{holding.quantity.toLocaleString()}</p>
                                        <p className="text-right font-mono">₹{(holding.quantity * (holding.currentPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-brand-text-secondary">You do not have any bond holdings.</div>
                    )}
                </Card>

                <div className="space-y-6">
                    <Card>
                        <h3 className="text-xl font-semibold mb-4">Portfolio Value</h3>
                         <p className="text-4xl font-bold text-white mb-4">₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={portfolioChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                    {portfolioChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}/>
                                <Legend/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                     <Card>
                        <WalletAndFunds user={user} onAddFunds={onOpenAddFunds} />
                    </Card>
                </div>
            </div>
            
            <Card>
                <div className="flex items-center space-x-2 mb-4">
                    <Icons.brainCircuit />
                    <h3 className="text-2xl font-bold">
                        Portfolio Optimizer
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-brand-text-secondary mb-2">Select Risk Profile</label>
                        <select
                            value={riskProfile}
                            onChange={(e) => setRiskProfile(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-md p-2"
                        >
                            <option value="conservative">Conservative</option>
                            <option value="balanced">Balanced</option>
                            <option value="aggressive">Aggressive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-brand-text-secondary mb-2">Select Primary Objective</label>
                        <select
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-md p-2"
                        >
                            <option value="balanced">Balanced Growth</option>
                            <option value="yield">Maximize Yield</option>
                            <option value="esg">High ESG Score</option>
                        </select>
                    </div>
                    <button onClick={handleOptimize} disabled={isOptimizing} className="bg-brand-primary text-black py-2 px-4 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                        {isOptimizing ? <><Icons.spinner className="animate-spin" /><span>Optimizing...</span></> : <span>Run Optimizer</span>}
                    </button>
                </div>
                {optimizedData && (
                    <div className="mt-8 pt-6 border-t border-brand-border grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div>
                            <h4 className="text-xl font-semibold mb-4 text-center">Suggested Allocation</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={optimizedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.name} ${entry.value}%`}>
                                        {optimizedData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {optimizationAnalysis && (
                            <div className="h-full">
                                <h4 className="text-xl font-semibold mb-4 text-center">Backend Analysis & Recommendations</h4>
                                <div className="gemini-analysis bg-brand-bg p-4 rounded-lg text-brand-text-secondary h-[300px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: optimizationAnalysis }} />
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Portfolio;
