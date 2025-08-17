import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from '../../Icons';
import AnalyticsEngineLog from '../AnalyticsEngineLog';

interface VolatilityTestProps {
  backendState: any;
}

const VolatilityTest: React.FC<VolatilityTestProps> = ({ backendState }) => {
    const [performanceData, setPerformanceData] = useState<{ time: string; ops: number }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setPerformanceData(prev => [
                ...prev,
                {
                    time: now.toLocaleTimeString(),
                    ops: backendState.metrics.OrderMatch.value,
                }
            ].slice(-20)); // Keep the last 20 data points
        }, 1800);
        return () => clearInterval(interval);
    }, [backendState.metrics.OrderMatch.value]);

    const swarmLogs = backendState.analyticsLogs.filter((l: any) => l.service === 'Swarm');

    return (
        <div>
            <div className="flex items-center space-x-3 mb-4">
                <Icons.fire className="h-8 w-8 text-brand-yellow" />
                <div>
                    <h2 className="text-xl font-bold text-white">Market Volatility Spike</h2>
                    <p className="text-sm text-brand-text-secondary">Simulating high-frequency trading and testing the AI Swarm Intelligence for liquidity routing.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Matching Engine Throughput (ops/sec)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                            <XAxis dataKey="time" stroke="#8B949E" fontSize={10} />
                            <YAxis stroke="#8B949E" domain={[0, 10000]} />
                            <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }} />
                            <Line type="monotone" dataKey="ops" name="Ops/sec" stroke="#D29922" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">AI Swarm Intelligence Log</h3>
                    <AnalyticsEngineLog logs={swarmLogs} limit={10} />
                </div>
            </div>
        </div>
    );
};

export default VolatilityTest;
