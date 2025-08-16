import React from 'react';
import { SystemMetrics, ServiceName } from '../../types';
import { Icons } from '../Icons';

interface DiagramProps {
  metrics: SystemMetrics;
  isContingencyMode: boolean;
}

type ServicePosition = {
    top: string;
    left: string;
    width?: string;
    height?: string;
};

const BIO_QUANTUM_POSITIONS: Record<ServiceName, ServicePosition> = {
    UserIntf: { top: '5%', left: '5%' },
    DPI: { top: '5%', left: '80%' },
    APIGW: { top: '35%', left: '5%' },
    OrderMatch: { top: '50%', left: '50%' }, // Center Nucleus
    TokenizSvc: { top: '35%', left: '80%' },
    Pricing: { top: '80%', left: '20%' },
    HederaHashgraph: { top: '80%', left: '65%' },
};

const STANDARD_POSITIONS: Record<ServiceName, Required<ServicePosition>> = {
    UserIntf: { top: '5%', left: '35%', width: '30%', height: '15%' },
    DPI: { top: '5%', left: '70%', width: '25%', height: '15%' },
    APIGW: { top: '25%', left: '5%', width: '25%', height: '15%' },
    OrderMatch: { top: '45%', left: '37.5%', width: '25%', height: '15%' },
    TokenizSvc: { top: '25%', left: '70%', width: '25%', height: '15%' },
    Pricing: { top: '65%', left: '5%', width: '25%', height: '15%' },
    HederaHashgraph: { top: '80%', left: '37.5%', width: '25%', height: '15%' },
};

const PATHS = {
    BIO_QUANTUM: [
        { from: 'UserIntf', to: 'DPI', stroke: '#1F6FEB' },
        { from: 'UserIntf', to: 'APIGW', stroke: '#58A6FF' },
        { from: 'APIGW', to: 'OrderMatch', stroke: '#58A6FF' },
        { from: 'OrderMatch', to: 'TokenizSvc', stroke: '#3FB950' },
        { from: 'TokenizSvc', to: 'HederaHashgraph', stroke: '#D29922' },
        { from: 'OrderMatch', to: 'HederaHashgraph', stroke: '#D29922' },
        { from: 'OrderMatch', to: 'Pricing', stroke: '#3FB950' },
        { from: 'Pricing', to: 'UserIntf', stroke: '#8B949E' },
    ],
    STANDARD: [
        { from: 'UserIntf', to: 'DPI', stroke: '#8B949E' },
        { from: 'UserIntf', to: 'APIGW', stroke: '#8B949E' },
        { from: 'APIGW', to: 'OrderMatch', stroke: '#8B949E' },
        { from: 'OrderMatch', to: 'TokenizSvc', stroke: '#8B949E' },
        { from: 'TokenizSvc', to: 'HederaHashgraph', stroke: '#8B949E' },
        { from: 'OrderMatch', to: 'Pricing', stroke: '#8B949E' },
        { from: 'Pricing', to: 'OrderMatch', stroke: '#8B949E' },
    ]
};

const getStatusColor = (status: 'Operational' | 'Degraded' | 'Down') => {
    if (status === 'Degraded') return 'text-brand-yellow';
    if (status === 'Down') return 'text-brand-red';
    return 'text-brand-green';
}

const SERVICE_CONFIG: Record<ServiceName, { title: string; desc: string }> = {
    UserIntf: { title: 'User Interface', desc: 'Retail & Institutional' },
    DPI: { title: 'DPI Aadhaar', desc: 'e-KYC Verification' },
    APIGW: { title: 'API Gateway', desc: 'Auth & Security' },
    OrderMatch: { title: 'Matching Engine', desc: 'Bio-Inspired Core' },
    TokenizSvc: { title: 'Tokenization', desc: 'Fractional Ownership' },
    Pricing: { title: 'Pricing Engine', desc: 'Quantum-Enhanced' },
    HederaHashgraph: { title: 'Settlement Layer', desc: 'Hedera DLT' },
};


const InteractiveArchitectureDiagram: React.FC<DiagramProps> = ({ metrics, isContingencyMode }) => {
    const mode = isContingencyMode ? 'standard' : 'bio-quantum';
    const positions = isContingencyMode ? STANDARD_POSITIONS : BIO_QUANTUM_POSITIONS;
    const paths = isContingencyMode ? PATHS.STANDARD : PATHS.BIO_QUANTUM;

    const getPathDefinition = (from: ServiceName, to: ServiceName) => {
        const fromPos = positions[from];
        const toPos = positions[to];
        if(!fromPos || !toPos) return "";

        const fromX = `calc(${fromPos.left} + ${isContingencyMode ? (parseFloat(fromPos.width!)/2)+'%' : '65px'})`;
        const fromY = `calc(${fromPos.top} + ${isContingencyMode ? (parseFloat(fromPos.height!)/2)+'%' : '65px'})`;
        const toX = `calc(${toPos.left} + ${isContingencyMode ? (parseFloat(toPos.width!)/2)+'%' : '65px'})`;
        const toY = `calc(${toPos.top} + ${isContingencyMode ? (parseFloat(toPos.height!)/2)+'%' : '65px'})`;

        if (isContingencyMode) {
             return `M ${fromX} ${fromY} L ${toX} ${toY}`;
        } else {
             const dx = (parseFloat(toPos.left) - parseFloat(fromPos.left));
             const dy = (parseFloat(toPos.top) - parseFloat(fromPos.top));
             const controlX1 = `calc(${fromX} + ${dx * 0.4}px)`;
             const controlY1 = `calc(${fromY} + ${dy * 0.1}px)`;
             const controlX2 = `calc(${toX} - ${dx * 0.1}px)`;
             const controlY2 = `calc(${toY} - ${dy * 0.4}px)`;
             return `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
        }
    };


    return (
        <div className={`arch-container ${mode}`}>
            <svg className="svg-overlay">
                <defs>
                    {paths.map((p, i) => (
                        <path id={`path-${i}`} key={`path-def-${i}`} d={getPathDefinition(p.from as ServiceName, p.to as ServiceName)} />
                    ))}
                </defs>
                {paths.map((p, i) => (
                    <use key={`path-use-${i}`} href={`#path-${i}`} className="flow-path" style={{ stroke: p.stroke }} />
                ))}
                {!isContingencyMode && paths.map((p, i) => (
                    <circle key={`pulse-${i}`} className="flow-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                        <animateMotion dur="5s" repeatCount="indefinite">
                            <mpath href={`#path-${i}`} />
                        </animateMotion>
                    </circle>
                ))}
            </svg>

            {Object.entries(positions).map(([key, pos]) => {
                const sKey = key as ServiceName;
                const metric = metrics[sKey];
                const config = SERVICE_CONFIG[sKey];
                const statusClass = metric.status === 'Down' ? 'status-down' : '';
                const modeStatusClass = isContingencyMode ? 'status-standard' : '';

                return (
                    <div key={key} id={`arch-${key}`} className={`arch-block ${statusClass} ${modeStatusClass}`} style={{ ...pos, transform: mode === 'bio-quantum' ? 'translate(-50%, -50%)' : 'none' }}>
                       {sKey === 'OrderMatch' && !isContingencyMode && <Icons.brainCircuit className="h-6 w-6 text-brand-primary mb-1"/>}
                        <div className="title text-sm">{isContingencyMode && metric.status === 'Down' ? `(Bypassed) ${config.title}` : config.title}</div>
                        <div className="desc">{config.desc}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default InteractiveArchitectureDiagram;