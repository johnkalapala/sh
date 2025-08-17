import React, { useState, useEffect } from 'react';
import { Icons } from '../../Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../shared/Card';

interface ScalabilityTestViewProps {
  backendState: any;
}

const TpsGauge: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = Math.min(1, value / max);
    const rotation = -90 + (percentage * 180);
    const color = percentage > 0.8 ? 'text-brand-red' : percentage > 0.6 ? 'text-brand-yellow' : 'text-brand-green';

    return (
        <div className="relative w-full max-w-xs mx-auto" style={{ paddingBottom: '50%' }}>
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 200 100">
                <path d="M 10 100 A 90 90 0 0 1 190 100" strokeWidth="20" stroke="#3f3f46" fill="none" />
                <path 
                    d="M 10 100 A 90 90 0 0 1 190 100" 
                    strokeWidth="20" 
                    className={`stroke-current ${color} transition-all duration-500`}
                    fill="none" 
                    strokeDasharray="282.74" 
                    strokeDashoffset={282.74 * (1 - percentage)}
                    strokeLinecap="round"
                />
                 <line
                    x1="100" y1="100" x2="100" y2="20"
                    stroke="#f4f4f5" strokeWidth="3"
                    style={{ transformOrigin: '100px 100px', transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s' }}
                />
                <circle cx="100" cy="100" r="5" fill="#f4f4f5" />
            </svg>
            <div className="absolute bottom-0 w-full text-center">
                <p className="text-3xl font-mono font-bold text-white">{(value/1000).toFixed(1)}k</p>
                <p className="text-sm text-brand-text-secondary">Transactions / sec</p>
            </div>
        </div>
    );
};


const ScalabilityTestView: React.FC<ScalabilityTestViewProps> = ({ backendState }) => {
    const { metrics } = backendState;
    const shards = [metrics.OrderMatchShard1, metrics.OrderMatchShard2, metrics.OrderMatchShard3];
    const totalTps = shards.reduce((acc, s) => acc + s.value, 0);

    const [latencyData, setLatencyData] = useState<any[]>([]);

    useEffect(() => {
         const now = new Date();
         setLatencyData(prev => [
            ...prev,
            {
                time: now.toLocaleTimeString(),
                shard1: shards[0].p99Latency,
                shard2: shards[1].p99Latency,
                shard3: shards[2].p99Latency,
            }
         ].slice(-20));
    }, [metrics]);
    
    const kafkaBuffer = metrics.Kafka.bufferSize || 0;
    const maxBuffer = 50000; // Arbitrary max for visualization
    const bufferPercent = Math.min(100, (kafkaBuffer / maxBuffer) * 100);

    return (
        <div>
            <div className="flex items-center space-x-3 mb-4">
                <Icons.scaling className="h-8 w-8 text-brand-green" />
                <div>
                    <h2 className="text-xl font-bold text-white">Market Pulse: High-Throughput Simulation</h2>
                    <p className="text-sm text-brand-text-secondary">Visualizing key performance indicators for a production-grade, sharded architecture.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <h3 className="text-lg font-semibold mb-2 text-center">Live Market Throughput</h3>
                    <TpsGauge value={totalTps} max={150000} />
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        {shards.map((shard, i) => (
                            <div key={i} className="bg-brand-surface p-2 rounded-md">
                                <p className="font-bold text-brand-text">Shard {i+1} TPS</p>
                                <p className="font-mono text-brand-primary">{shard.value.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                            </div>
                        ))}
                    </div>
                 </Card>
                 <Card>
                    <h3 className="text-lg font-semibold mb-2 text-center">P99 Order Matching Latency (ms)</h3>
                     <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={latencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                            <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} />
                            <YAxis stroke="#a1a1aa" domain={[0, 40]} />
                            <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
                            <Line type="monotone" dataKey="shard1" name="Shard 1" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="shard2" name="Shard 2" stroke="#22c55e" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="shard3" name="Shard 3" stroke="#eab308" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                 </Card>
                 <Card className="lg:col-span-2">
                     <h3 className="text-lg font-semibold mb-2">Kafka Message Queue Status</h3>
                     <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <p className="text-sm text-brand-text-secondary">Ingress</p>
                            <p className="text-2xl font-mono font-bold text-white">{(metrics.Kafka.value / 1000).toFixed(1)}k</p>
                            <p className="text-xs text-brand-text-secondary">msg/s</p>
                        </div>
                        <div className="flex-grow">
                             <p className="text-sm text-brand-text-secondary mb-1">Buffer Size</p>
                             <div className="w-full h-6 bg-brand-surface rounded-full flex overflow-hidden border border-brand-border">
                                <div className="h-full bg-brand-primary" style={{ width: `${bufferPercent}%` }}></div>
                            </div>
                            <p className="text-xs text-right text-brand-text-secondary mt-1">{kafkaBuffer.toLocaleString(undefined, {maximumFractionDigits:0})} / {maxBuffer.toLocaleString()}</p>
                        </div>
                     </div>
                 </Card>
            </div>
        </div>
    );
};

export default ScalabilityTestView;