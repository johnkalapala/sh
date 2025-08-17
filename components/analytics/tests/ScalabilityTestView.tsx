import React from 'react';
import { Icons } from '../../Icons';
import AnalyticsEngineLog from '../AnalyticsEngineLog';

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
                <path d="M 10 100 A 90 90 0 0 1 190 100" strokeWidth="20" stroke="#30363D" fill="none" />
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
                    stroke="#C9D1D9" strokeWidth="3"
                    style={{ transformOrigin: '100px 100px', transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s' }}
                />
                <circle cx="100" cy="100" r="5" fill="#C9D1D9" />
            </svg>
            <div className="absolute bottom-0 w-full text-center">
                <p className="text-3xl font-mono font-bold text-white">{(value/1000).toFixed(1)}k</p>
                <p className="text-sm text-brand-text-secondary">Transactions / sec</p>
            </div>
        </div>
    );
};


const ScalabilityTestView: React.FC<ScalabilityTestViewProps> = ({ backendState }) => {
    const { metrics, analyticsLogs } = backendState;
    const shards = [metrics.OrderMatchShard1, metrics.OrderMatchShard2, metrics.OrderMatchShard3];
    const totalTps = shards.reduce((acc, s) => acc + s.value, 0);

    const aggLogs = analyticsLogs.filter((l: any) => l.service === 'AggregationSvc');

    const sectors = [
        { name: 'Financials', volume: metrics.OrderMatchShard2.value },
        { name: 'PSU/Infra', volume: metrics.OrderMatchShard1.value },
        { name: 'Corporate', volume: metrics.OrderMatchShard3.value },
        { name: 'Other', volume: totalTps * 0.1 * Math.random() },
    ];
    const maxVolume = Math.max(...sectors.map(s => s.volume));

    return (
        <div>
            <div className="flex items-center space-x-3 mb-4">
                <Icons.scaling className="h-8 w-8 text-brand-green" />
                <div>
                    <h2 className="text-xl font-bold text-white">High-Throughput Scalability Test</h2>
                    <p className="text-sm text-brand-text-secondary">Simulating billion-trade daily volume with a sharded, production-grade architecture.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Live Market Throughput</h3>
                    <TpsGauge value={totalTps} max={150000} />
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        {shards.map((shard, i) => (
                            <div key={i} className="bg-brand-surface p-2 rounded-md">
                                <p className="font-bold text-brand-text">Shard {i+1}</p>
                                <p className="font-mono text-brand-primary">{shard.value.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Sector Volume Heatmap</h3>
                    <div className="space-y-2">
                        {sectors.map(sector => (
                            <div key={sector.name} className="flex items-center space-x-2">
                                <span className="w-24 text-sm text-right text-brand-text-secondary">{sector.name}</span>
                                <div className="flex-1 h-6 bg-brand-surface rounded-sm">
                                    <div 
                                        className="h-full bg-gradient-to-r from-brand-green/50 to-brand-green rounded-sm" 
                                        style={{ width: `${(sector.volume / maxVolume) * 100}%`}}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 mt-4 text-center">Aggregation Service Log</h3>
                    <AnalyticsEngineLog logs={aggLogs} limit={5} />
                </div>
            </div>
        </div>
    );
};

export default ScalabilityTestView;