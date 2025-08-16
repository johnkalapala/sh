import React from 'react';
import Card from '../shared/Card';
import InteractiveArchitectureDiagram from './InteractiveArchitectureDiagram';
import LiveTransactionFeed from './LiveTransactionFeed';
import AnalyticsEngineLog from './AnalyticsEngineLog';

interface SystemAnalyticsProps {
  backendState: any;
}

const SystemAnalytics: React.FC<SystemAnalyticsProps> = ({ backendState }) => {
  return (
    <div className="space-y-6">
        <Card>
            <h2 className="text-2xl font-bold mb-2">Live System Architecture</h2>
            <p className="text-brand-text-secondary mb-4">
                This diagram represents the real-time health and data flow of the QuantumBond platform's bio-inspired microservices architecture. 
                Animated pulses indicate live data movement.
            </p>
            <InteractiveArchitectureDiagram metrics={backendState.metrics} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h3 className="text-xl font-semibold mb-4">Full Transaction Feed</h3>
                <LiveTransactionFeed transactions={backendState.transactions} />
            </Card>
            <Card>
                <h3 className="text-xl font-semibold mb-4">AI Pricing Engine Log</h3>
                <AnalyticsEngineLog logs={backendState.analyticsLogs} />
            </Card>
        </div>
    </div>
  );
};

export default SystemAnalytics;
