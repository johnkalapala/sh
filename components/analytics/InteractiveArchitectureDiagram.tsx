import React from 'react';
import { SystemMetrics, ServiceName } from '../../types';

interface DiagramProps {
  metrics: SystemMetrics;
}

const SERVICE_CONFIG: Record<ServiceName, { gridArea: string, title: string, color: string }> = {
    UserIntf: { gridArea: '1 / 1 / 3 / 4', title: 'User Intf.', color: 'border-cyan-500' },
    DPI: { gridArea: '1 / 10 / 2 / 13', title: 'DPI Aadhaar', color: 'border-purple-500' },
    APIGW: { gridArea: '3 / 4 / 5 / 6', title: 'API GW/Auth.', color: 'border-red-500' },
    OrderMatch: { gridArea: '3 / 6 / 8 / 9', title: 'Order/Match Eng.', color: 'border-green-500' },
    TokenizSvc: { gridArea: '6 / 9 / 7 / 10', title: 'Tokeniz. Svc.', color: 'border-yellow-500' },
    Pricing: { gridArea: '8 / 7 / 10 / 10', title: 'Pricing/Analyt. Eng.', color: 'border-gray-500' },
    Settlement: { gridArea: '5 / 10 / 8 / 13', title: 'Settlement/Paymt.', color: 'border-red-700' },
};

const getStatusColor = (status: 'Operational' | 'Degraded' | 'Down') => {
    if (status === 'Degraded') return 'text-yellow-400';
    if (status === 'Down') return 'text-red-500';
    return 'text-green-400';
}

const paths = [
    // User -> DPI
    { d: "M 100 50 C 400 50, 600 50, 950 50", stroke: "#06b6d4" },
    // User -> API GW
    { d: "M 150 100 C 200 150, 250 200, 300 220", stroke: "#06b6d4" },
    // API GW -> Order/Match
    { d: "M 450 220 C 460 220, 470 220, 480 220", stroke: "#ef4444" },
    // Order/Match -> Tokeniz
    { d: "M 680 300 C 720 320, 750 350, 780 370", stroke: "#22c55e" },
    // Order/Match -> Pricing
    { d: "M 600 400 C 600 450, 600 500, 600 500", stroke: "#22c55e" },
    // Tokeniz -> Settlement
    { d: "M 830 370 C 850 370, 880 360, 900 350", stroke: "#eab308" },
    // Pricing -> User (feedback loop)
    { d: "M 600 550 C 400 600, 100 600, 50 400 C 0 200, 50 150, 100 150", stroke: "#6b7280" },
    // Pricing -> Settlement
    { d: "M 750 500 C 800 480, 850 450, 900 420", stroke: "#6b7280" },
];

const InteractiveArchitectureDiagram: React.FC<DiagramProps> = ({ metrics }) => {
    return (
        <div className="arch-grid p-4 bg-brand-bg rounded-lg relative">
            <svg className="svg-overlay" viewBox="0 0 1100 600" preserveAspectRatio="none">
                {paths.map((p, i) => (
                    <path key={i} d={p.d} className="flow-path" style={{ stroke: p.stroke, strokeOpacity: 0.6 }} />
                ))}
                 {paths.map((p, i) => (
                    <circle key={`pulse-${i}`} className="flow-pulse" style={{ animationDelay: `${i*0.3}s` }}>
                        <animateMotion dur="5s" repeatCount="indefinite" path={p.d} />
                    </circle>
                ))}
            </svg>

            {Object.entries(SERVICE_CONFIG).map(([key, config]) => {
                const metric = metrics[key as ServiceName];
                return (
                    <div key={key} className={`arch-block ${config.color}`} style={{ gridArea: config.gridArea }}>
                        <div className="title text-sm">{config.title}</div>
                        <div className="metric">
                            <span className="metric-value">{metric.value.toFixed(metric.unit === '%' || metric.unit ==='ms' ? 1: 0)}</span> {metric.unit}
                        </div>
                         <div className={`text-xs font-bold ${getStatusColor(metric.status)}`}>{metric.status}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default InteractiveArchitectureDiagram;