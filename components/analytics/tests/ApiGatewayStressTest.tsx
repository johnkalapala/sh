import React from 'react';
import { Icons } from '../../Icons';
import AnalyticsEngineLog from '../AnalyticsEngineLog';

interface ApiGatewayStressTestProps {
  backendState: any;
}

const ApiGatewayStressTest: React.FC<ApiGatewayStressTestProps> = ({ backendState }) => {
    const metrics = backendState.metrics.APIGW;
    const totalRequests = metrics.value;
    const blockedRequests = metrics.requestsBlocked || 0;
    const successfulRequests = totalRequests - blockedRequests;
    
    const blockedPercent = totalRequests > 0 ? (blockedRequests / totalRequests) * 100 : 0;
    const successfulPercent = 100 - blockedPercent;
    
    const aisLogs = backendState.analyticsLogs.filter((l: any) => l.service === 'AIS');

    return (
         <div>
            <div className="flex items-center space-x-3 mb-4">
                <Icons.server className="h-8 w-8 text-brand-red" />
                <div>
                    <h2 className="text-xl font-bold text-white">API Gateway Overload</h2>
                    <p className="text-sm text-brand-text-secondary">Testing system resilience and the Artificial Immune System (AIS) response.</p>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Live Traffic Analysis</h3>
                    <div className="space-y-4">
                        <div className="text-center p-4 bg-brand-surface rounded-lg">
                            <p className="text-brand-text-secondary">Total Incoming Requests/sec</p>
                            <p className="text-3xl font-mono font-bold text-white">{totalRequests.toFixed(0)}</p>
                        </div>
                         <div className="w-full h-8 bg-brand-surface rounded-full flex overflow-hidden border border-brand-border">
                            <div className="h-full bg-brand-green" style={{ width: `${successfulPercent}%` }} title={`Successful: ${successfulRequests.toFixed(0)}`}></div>
                            <div className="h-full bg-brand-red" style={{ width: `${blockedPercent}%` }} title={`Blocked by AIS: ${blockedRequests.toFixed(0)}`}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <div className="text-center">
                                <p className="font-bold text-brand-green">{successfulRequests.toFixed(0)}</p>
                                <p className="text-brand-text-secondary">Allowed</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-brand-red">{blockedRequests.toFixed(0)}</p>
                                <p className="text-brand-text-secondary">Blocked</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Artificial Immune System Log</h3>
                    <AnalyticsEngineLog logs={aisLogs} limit={10} />
                </div>
            </div>
        </div>
    );
};

export default ApiGatewayStressTest;
