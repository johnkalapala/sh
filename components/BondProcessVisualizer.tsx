
import React from 'react';
import { SystemMetrics, ServiceName } from '../types';
import { Icons } from './Icons';

interface BondProcessVisualizerProps {
    backendState: {
        metrics: SystemMetrics;
    };
    isContingencyMode: boolean;
}

const RETAIL_STEPS: { name: string; service: ServiceName }[] = [
    { name: 'Order Matching', service: 'OrderMatch' },
    { name: 'Tokenization', service: 'TokenizSvc' },
    { name: 'Retail Trade Confirmation', service: 'HederaHashgraph' },
];

const INSTITUTIONAL_STEPS: { name: string; service: ServiceName; icon: React.ReactNode }[] = [
    { name: 'Regulatory Gateway', service: 'RegulatoryGateway', icon: <Icons.shieldNodes /> },
    { name: 'Institutional Batch Settlement', service: 'HederaHashgraph', icon: <Icons.database /> },
];

const getStatusInfo = (status: 'Operational' | 'Degraded' | 'Down' | 'Active') => {
    switch (status) {
        case 'Active':
        case 'Operational':
            return { icon: <Icons.status.ok />, color: 'text-brand-green', border: 'border-brand-green' };
        case 'Degraded':
            return { icon: <Icons.status.pending />, color: 'text-brand-yellow', border: 'border-brand-yellow' };
        case 'Down':
            return { icon: <Icons.status.error />, color: 'text-brand-red', border: 'border-brand-red' };
        default:
            return { icon: null, color: '', border: 'border-brand-border' };
    }
};

const ProcessStep: React.FC<{ name: string, service: ServiceName, metric: any, isLast?: boolean }> = ({ name, service, metric, isLast = false }) => {
    const statusInfo = getStatusInfo(metric.status);
    return (
        <React.Fragment>
            <div className="flex flex-col items-center text-center w-1/4 px-2">
                <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center ${statusInfo.border}`}>
                    {statusInfo.icon}
                </div>
                <p className="font-semibold mt-2 text-brand-text text-sm">{name}</p>
                <p className={`text-xs font-mono ${statusInfo.color}`}>
                    {metric.value.toFixed(metric.unit === 's' ? 1 : 0)} {metric.unit}
                </p>
            </div>
            {!isLast && <div className="flex-1 h-1 bg-brand-border rounded-full" />}
        </React.Fragment>
    );
};


const BondProcessVisualizer: React.FC<BondProcessVisualizerProps> = ({ backendState, isContingencyMode }) => {
    return (
        <div className="bg-brand-bg p-4 rounded-lg space-y-6">
            <div>
                 <h4 className="font-bold text-brand-primary mb-3 text-center">Retail Liquidity Loop (Hedera DLT)</h4>
                 <p className="text-xs text-brand-text-secondary text-center mb-4">High-speed settlement for fractional trades between platform users.</p>
                <div className="flex items-center justify-between">
                    {RETAIL_STEPS.map((step, index) => (
                        <ProcessStep 
                            key={step.name} 
                            name={step.name} 
                            service={step.service} 
                            metric={backendState.metrics[step.service]} 
                            isLast={index === RETAIL_STEPS.length - 1} 
                        />
                    ))}
                </div>
            </div>
             <div className="border-t border-dashed border-brand-border"></div>
             <div>
                 <h4 className="font-bold text-purple-400 mb-3 text-center">Institutional & Regulatory Loop (Permissioned DLT)</h4>
                  <p className="text-xs text-brand-text-secondary text-center mb-4">Aggregated, netted settlements reported to the institutional network for compliance and finality.</p>
                <div className="flex items-center justify-between">
                     {INSTITUTIONAL_STEPS.map((step, index) => {
                         const metric = backendState.metrics[step.service];
                         const statusInfo = getStatusInfo(metric.status);
                         return (
                              <React.Fragment key={step.name}>
                                <div className="flex flex-col items-center text-center w-1/3 px-2">
                                    <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center ${statusInfo.border}`}>
                                        {step.icon}
                                    </div>
                                    <p className="font-semibold mt-2 text-brand-text text-sm">{step.name}</p>
                                    <p className={`text-xs font-mono ${statusInfo.color}`}>
                                       {step.service === 'RegulatoryGateway' ? `${metric.value} tx/min` : isContingencyMode ? 'Offline' : `Batched`}
                                    </p>
                                </div>
                                {index < INSTITUTIONAL_STEPS.length - 1 && (
                                    <div className="flex-1 h-1 bg-brand-border rounded-full" />
                                )}
                            </React.Fragment>
                         )
                     })}
                </div>
            </div>
        </div>
    );
};

export default BondProcessVisualizer;
