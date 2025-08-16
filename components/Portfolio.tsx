import React, { useState } from 'react';
import Card from './shared/Card';
import { BONDS } from '../constants';
import { PortfolioHolding, ViewState, User } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Icons } from './Icons';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57' ];

interface PortfolioProps {
    userPortfolio: PortfolioHolding[];
    navigate: (view: ViewState) => void;
    user: User;
}

const Portfolio: React.FC<PortfolioProps> = ({ userPortfolio, navigate, user }) => {
    const [riskProfile, setRiskProfile] = useState('balanced');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<any[] | null>(null);

    const portfolioBonds = userPortfolio.map(holding => {
        const bondDetails = BONDS.find(b => b.id === holding.bondId);
        return { ...holding, ...bondDetails };
    });

    const holdingsValue = portfolioBonds.reduce((acc, holding) => {
        return acc + (holding.quantity * (holding.currentPrice || 0));
    }, 0);
    
    const totalValue = holdingsValue + user.balance;

    const portfolioChartData = [
        ...portfolioBonds.map(holding => ({
            name: holding.issuer || 'Unknown',
            value: holding.quantity * (holding.currentPrice || 0)
        })),
        { name: 'Cash', value: user.balance }
    ];
    
    const handleOptimize = () => {
        setIsOptimizing(true);
        setOptimizedData(null);
        setTimeout(() => {
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
            setOptimizedData(newOptimizedData);
            setIsOptimizing(false);
        }, 2000);
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
                                <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}/>
                                <Legend/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                     <Card>
                        <h3 className="text-xl font-semibold mb-4">Cash Balance</h3>
                        <p className="text-3xl font-bold text-white">₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </Card>
                </div>
            </div>
            
            <Card>
                <h3 className="text-2xl font-bold mb-4">Quantum Portfolio Optimizer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-2">
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
                    <button onClick={handleOptimize} disabled={isOptimizing} className="bg-brand-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                        {isOptimizing ? <><Icons.spinner className="animate-spin" /><span>Optimizing...</span></> : <span>Run Optimizer</span>}
                    </button>
                </div>
                {optimizedData && (
                    <div className="mt-6">
                        <h4 className="text-xl font-semibold mb-4">Suggested Allocation</h4>
                        <ResponsiveContainer width="100%" height={300}>
                             <PieChart>
                                <Pie data={optimizedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.name} ${entry.value}%`}>
                                    {optimizedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Portfolio;