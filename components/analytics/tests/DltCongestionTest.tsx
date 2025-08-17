import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from '../../Icons';
import LiveTransactionFeed from '../LiveTransactionFeed';

interface DltCongestionTestProps {
  backendState: any;
}

const DltCongestionTest: React.FC<DltCongestionTestProps> = ({ backendState }) => {
    const [performanceData, setPerformanceData] = useState<{ time: string; settlementTime: number }[]>([]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setPerformanceData(prev => [
                ...prev,
                {
                    time: now.toLocaleTimeString(),
                    settlementTime: backendState.metrics.HederaHashgraph.value,
                }
            ].slice(-20));
        }, 1800);
        return () => clearInterval(interval);
    }, [backendState.metrics.HederaHashgraph.value]);
    
    const pendingTransactions = backendState.transactions.filter((t: any) => t.status === 'PENDING' && t.type === 'SETTLEMENT');
    const queueSize = backendState.metrics.HederaHashgraph.pendingQueue || 0;

    return (
         <div>
            <div className="flex items-center space-x-3 mb-4">
                <Icons.clock className="h-8 w-8 text-brand-yellow" />
                <div>
                    <h2 className="text-xl font-bold text-white">DLT Network Congestion</h2>
                    <p className="text-sm text-brand-text-secondary">Simulating a slowdown on the Hedera Hashgraph settlement layer.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                     <h3 className="text-lg font-semibold mb-2 text-center">DLT Settlement Time (seconds)</h3>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                            <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} />
                            <YAxis stroke="#a1a1aa" domain={[0, 15]} />
                            <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
                            <Bar dataKey="settlementTime" name="Settlement Time (s)" fill="#eab308" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                     <h3 className="text-lg font-semibold mb-2 text-center">Pending Settlement Queue</h3>
                     <div className="text-center p-4 mb-2 bg-brand-surface rounded-lg">
                        <p className="text-brand-text-secondary">Transactions in Queue</p>
                        <p className="text-3xl font-mono font-bold text-white animate-pulse">{queueSize.toLocaleString()}</p>
                    </div>
                     <LiveTransactionFeed transactions={pendingTransactions} limit={5} />
                </div>
            </div>
        </div>
    );
};

export default DltCongestionTest;