import React from 'react';
import { SystemMetrics, ServiceName } from '../types';
import { Icons } from './Icons';

interface BondProcessVisualizerProps {
    backendState: {
        metrics: SystemMetrics;
    };
}

const STEPS: { name: string; service: ServiceName }[] = [
    { name: 'Order Matching', service: 'OrderMatch' },
    { name: 'Bio-Inspired Tokenization', service: 'TokenizSvc' },
    { name: 'Quantum-Accelerated DLT Settlement', service: 'HederaHashgraph' },
];

const getStatusInfo = (status: 'Operational' | 'Degraded' | 'Down') => {
    switch (status) {
        case 'Operational':
            return { icon: <Icons.status.ok className="text-brand-green" />, text: 'Operational', color: 'text-brand-green' };
        case 'Degraded':
            return { icon: <Icons.status.pending className="text-brand-yellow" />, text: 'Degraded', color: 'text-brand-yellow' };
        case 'Down':
            return { icon: <Icons.status.error className="text-brand-red" />, text: 'Down', color: 'text-brand-red' };
        default:
            return { icon: null, text: 'Unknown', color: '' };
    }
};

const BondProcessVisualizer: React.FC<BondProcessVisualizerProps> = ({ backendState }) => {
    return (
        <div className="bg-brand-bg p-4 rounded-lg">
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                    const metric = backendState.metrics[step.service];
                    const statusInfo = getStatusInfo(metric.status);
                    
                    return (
                        <React.Fragment key={step.name}>
                            <div className="flex flex-col items-center text-center w-1/3 px-2">
                                <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center ${metric.status === 'Operational' ? 'border-brand-green' : 'border-brand-yellow'}`}>
                                    {statusInfo.icon}
                                </div>
                                <p className="font-semibold mt-2 text-brand-text text-sm">{step.name}</p>
                                <p className={`text-xs font-mono ${statusInfo.color}`}>
                                    {metric.value.toFixed(metric.unit === 's' ? 1 : 0)} {metric.unit}
                                </p>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className="flex-1 h-1 bg-brand-border rounded-full" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default BondProcessVisualizer;