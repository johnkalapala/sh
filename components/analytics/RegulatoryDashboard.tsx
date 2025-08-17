import React, { useState, useEffect, useMemo } from 'react';
import Card from '../shared/Card';
import { generateRegulatoryDashboardSummary } from '../../services/geminiService';
import { Icons } from '../Icons';
import Spinner from '../shared/Spinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BONDS } from '../../constants';

const COLORS = ['#58A6FF', '#1F6FEB', '#3FB950', '#D29922', '#A371F7'];

const RegulatoryDashboard: React.FC<{ backendState: any }> = ({ backendState }) => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { transactions, analyticsLogs } = backendState;

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            try {
                const result = await generateRegulatoryDashboardSummary();
                setSummary(result);
            } catch (error) {
                console.error("Failed to fetch regulatory summary:", error);
                setSummary("Failed to load AI summary.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const largeTrades = useMemo(() => {
        return transactions
            .filter((tx: any) => tx.details.includes('Block trade'))
            .slice(0, 10);
    }, [transactions]);
    
    const aisAlerts = useMemo(() => {
        return analyticsLogs
            .filter((log: any) => log.service === 'AIS')
            .slice(0, 10);
    }, [analyticsLogs]);
    
     const concentrationData = useMemo(() => {
        const top5 = [...BONDS].sort((a,b) => b.volume - a.volume).slice(0,5);
        const top5Volume = top5.reduce((acc, bond) => acc + bond.volume, 0);
        const otherVolume = BONDS.slice(5).reduce((acc, bond) => acc + bond.volume, 0);

        return [
            ...top5.map(bond => ({ name: bond.issuer, value: bond.volume })),
            { name: 'Other', value: otherVolume }
        ];
    }, []);


    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center space-x-3">
                    <Icons.shieldNodes className="h-8 w-8 text-purple-400" />
                    <div>
                        <h2 className="text-2xl font-bold">Regulatory & Supervisory Dashboard</h2>
                        <p className="text-brand-text-secondary">Simulated real-time market oversight via the Regulatory Gateway.</p>
                    </div>
                </div>
            </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="flex items-center space-x-2 mb-4">
                        <Icons.gemini />
                        <h3 className="text-xl font-semibold">AI Market Summary</h3>
                    </div>
                     {isLoading ? <Spinner /> : (
                        <div className="gemini-analysis text-brand-text-secondary h-[350px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: summary }} />
                    )}
                </Card>
                 <Card>
                    <h3 className="text-xl font-semibold mb-4 text-center">Market Concentration by Volume</h3>
                     <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie data={concentrationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={2}>
                                {concentrationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
             </div>
             <Card>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div>
                        <h3 className="text-xl font-semibold mb-4 text-center">Large Block Trade Feed</h3>
                        <div className="bg-brand-bg rounded-lg p-2 space-y-2 h-[400px] overflow-y-auto">
                           {largeTrades.map((tx: any) => (
                                <div key={tx.id} className="p-2 bg-brand-surface rounded-md border-l-2 border-l-purple-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-semibold text-xs text-brand-text">BLOCK TRADE</span>
                                            <p className="text-xs text-brand-text-secondary truncate pr-2">{tx.details}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs font-bold text-brand-green">{tx.status}</span>
                                            <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    {tx.dltHash && (
                                        <div className="mt-1 pt-1 border-t border-brand-border">
                                            <p className="text-xs text-purple-400 font-mono truncate" title={tx.dltHash}>Settlement Hash: {tx.dltHash.substring(0, 20)}...</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                     </div>
                     <div>
                        <h3 className="text-xl font-semibold mb-4 text-center">Anomalous Activity Log (AIS)</h3>
                        <div className="bg-brand-bg rounded-lg p-2 space-y-2 h-[400px] overflow-y-auto text-xs font-mono">
                             {aisAlerts.map((log: any) => (
                                <div key={log.id} className="p-1">
                                    <span className="text-cyan-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span className="text-red-400"> [{log.service}] {log.message}</span>
                                </div>
                             ))}
                        </div>
                     </div>
                 </div>
             </Card>
        </div>
    );
};

export default RegulatoryDashboard;