import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from '../../Icons';
import AnalyticsEngineLog from '../AnalyticsEngineLog';
import Card from '../../shared/Card';

interface VolatilityTestProps {
  backendState: any;
}

const VolatilityTest: React.FC<VolatilityTestProps> = ({ backendState }) => {
    const [performanceData, setPerformanceData] = useState<{ time: string; ops: number }[]>([]);
    const { isCircuitBreakerTripped } = backendState;

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

    const swarmLogs = backendState.analyticsLogs.filter((l: any) => l.service === 'Swarm' || l.service === 'CircuitBreaker');

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
                            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                            <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} />
                            <YAxis stroke="#a1a1aa" domain={[0, 10000]} />
                            <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
                            <Line type="monotone" dataKey="ops" name="Ops/sec" stroke="#eab308" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Circuit Breaker & Swarm Log</h3>
                     <Card className={`text-center mb-4 transition-all ${isCircuitBreakerTripped ? 'border-brand-red bg-brand-red/10' : 'border-brand-green bg-brand-green/10'}`}>
                        <p className="font-bold text-lg">
                            Circuit Breaker: <span className={isCircuitBreakerTripped ? 'text-brand-red' : 'text-brand-green'}>{isCircuitBreakerTripped ? 'TRIPPED' : 'ARMED'}</span>
                        </p>
                    </Card>
                    <AnalyticsEngineLog logs={swarmLogs} limit={8} />
                </div>
            </div>
        </div>
    );
};

export default VolatilityTest;