import React from 'react';
import { SystemMetrics, ServiceName, ScenarioType } from '../../types';
import { Icons } from '../Icons';

interface DiagramProps {
  metrics: SystemMetrics;
  isContingencyMode: boolean;
  activeScenario: ScenarioType;
}

type ServicePosition = {
    top: string;
    left: string;
    width?: string;
    height?: string;
};

const BIO_QUANTUM_POSITIONS: Record<ServiceName, ServicePosition> = {
    UserIntf: { top: '20%', left: '15%' },
    DPI: { top: '20%', left: '85%' },
    APIGW: { top: '50%', left: '10%' },
    OrderMatch: { top: '50%', left: '50%' }, // Center Nucleus
    TokenizSvc: { top: '50%', left: '90%' },
    Pricing: { top: '80%', left: '30%' },
    HederaHashgraph: { top: '80%', left: '70%' },
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
        { from: 'UserIntf', to: 'DPI' },
        { from: 'UserIntf', to: 'APIGW' },
        { from: 'APIGW', to: 'OrderMatch' },
        { from: 'OrderMatch', to: 'TokenizSvc' },
        { from: 'TokenizSvc', to: 'HederaHashgraph' },
        { from: 'OrderMatch', to: 'HederaHashgraph' },
        { from: 'OrderMatch', to: 'Pricing' },
        { from: 'Pricing', to: 'UserIntf' },
    ],
    STANDARD: [
        { from: 'UserIntf', to: 'DPI' },
        { from: 'UserIntf', to: 'APIGW' },
        { from: 'APIGW', to: 'OrderMatch' },
        { from: 'OrderMatch', to: 'TokenizSvc' },
        { from: 'TokenizSvc', to: 'HederaHashgraph' },
        { from: 'OrderMatch', to: 'Pricing' },
        { from: 'Pricing', to: 'OrderMatch' },
    ]
};


const SERVICE_CONFIG: Record<ServiceName, { title: string; desc: string }> = {
    UserIntf: { title: 'User Interface', desc: 'Retail & Institutional' },
    DPI: { title: 'DPI Aadhaar', desc: 'e-KYC Verification' },
    APIGW: { title: 'Membrane Gateway', desc: 'AIS Security' },
    OrderMatch: { title: 'Quantum Nucleus', desc: 'Bio-Inspired Matching' },
    TokenizSvc: { title: 'Tokenization', desc: 'Fractional Ownership' },
    Pricing: { title: 'Quantum Oracle', desc: 'Enhanced Pricing' },
    HederaHashgraph: { title: 'Settlement Layer', desc: 'Hedera DLT' },
};


const InteractiveArchitectureDiagram: React.FC<DiagramProps> = ({ metrics, isContingencyMode, activeScenario }) => {
    const mode = isContingencyMode ? 'standard' : 'bio-quantum';
    const positions = isContingencyMode ? STANDARD_POSITIONS : BIO_QUANTUM_POSITIONS;
    const paths = isContingencyMode ? PATHS.STANDARD : PATHS.BIO_QUANTUM;
    const isUnderAttack = activeScenario === 'API_GATEWAY_OVERLOAD';

    const getPathDefinition = (from: ServiceName, to: ServiceName, entangled: boolean) => {
        const fromPos = positions[from];
        const toPos = positions[to];
        if(!fromPos || !toPos) return entangled ? { d1: "", d2: "" } : "";

        const fromX = `calc(${fromPos.left} + ${isContingencyMode ? (parseFloat(fromPos.width!)/2)+'%' : '65px'})`;
        const fromY = `calc(${fromPos.top} + ${isContingencyMode ? (parseFloat(fromPos.height!)/2)+'%' : '65px'})`;
        const toX = `calc(${toPos.left} + ${isContingencyMode ? (parseFloat(toPos.width!)/2)+'%' : '65px'})`;
        const toY = `calc(${toPos.top} + ${isContingencyMode ? (parseFloat(toPos.height!)/2)+'%' : '65px'})`;

        if (isContingencyMode) {
             return `M ${fromX} ${fromY} L ${toX} ${toY}`;
        } else {
             const dx = (parseFloat(toPos.left) - parseFloat(fromPos.left));
             const dy = (parseFloat(toPos.top) - parseFloat(fromPos.top));

             // Path 1
             const controlX1_1 = `calc(${fromX} + ${dx * 0.4}px)`;
             const controlY1_1 = `calc(${fromY} + ${dy * 0.1}px)`;
             const controlX2_1 = `calc(${toX} - ${dx * 0.1}px)`;
             const controlY2_1 = `calc(${toY} - ${dy * 0.4}px)`;
             const d1 = `M ${fromX} ${fromY} C ${controlX1_1} ${controlY1_1}, ${controlX2_1} ${controlY2_1}, ${toX} ${toY}`;

             // Path 2 (swapped control points for interwoven effect)
             const controlX1_2 = `calc(${fromX} + ${dx * 0.1}px)`;
             const controlY1_2 = `calc(${fromY} + ${dy * 0.4}px)`;
             const controlX2_2 = `calc(${toX} - ${dx * 0.4}px)`;
             const controlY2_2 = `calc(${toY} - ${dy * 0.1}px)`;
             const d2 = `M ${fromX} ${fromY} C ${controlX1_2} ${controlY1_2}, ${controlX2_2} ${controlY2_2}, ${toX} ${toY}`;
             
             return { d1, d2 };
        }
    };


    return (
        <div className={`arch-container ${mode}`}>
            <svg className="svg-overlay">
                {!isContingencyMode && (
                    <ellipse
                        cx="50%" cy="50%" rx="48%" ry="45%"
                        className={`transition-all duration-500 ${isUnderAttack ? 'stroke-brand-red animate-glow-red' : 'stroke-brand-primary animate-membrane'}`}
                        fill="none"
                    />
                )}
                <defs>
                    {paths.map((p, i) => {
                        if (isContingencyMode) {
                           return <path id={`path-${i}`} key={`path-def-${i}`} d={getPathDefinition(p.from as ServiceName, p.to as ServiceName, false) as string} />
                        }
                        const {d1, d2} = getPathDefinition(p.from as ServiceName, p.to as ServiceName, true) as {d1: string, d2: string};
                        return (
                           <React.Fragment key={`path-def-${i}`}>
                             <path id={`path-${i}-a`} d={d1} />
                             <path id={`path-${i}-b`} d={d2} />
                           </React.Fragment>
                        )
                    })}
                </defs>

                {paths.map((p, i) => {
                    if (isContingencyMode) {
                        return <use key={`path-use-${i}`} href={`#path-${i}`} className="flow-path" stroke="#8B949E" />
                    }
                     return (
                           <React.Fragment key={`path-use-${i}`}>
                             <use href={`#path-${i}-a`} className="flow-path" stroke="#58A6FF" />
                             <use href={`#path-${i}-b`} className="flow-path" stroke="#3FB950" />
                           </React.Fragment>
                        )
                })}

                {!isContingencyMode && paths.map((p, i) => (
                    <circle key={`pulse-${i}`} className="flow-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                        <animateMotion dur="5s" repeatCount="indefinite">
                            <mpath href={`#path-${i}-a`} />
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
                const isNucleus = sKey === 'OrderMatch';

                return (
                    <div key={key} id={`arch-${key}`} 
                         className={`arch-block ${statusClass} ${modeStatusClass} ${!isContingencyMode && !isNucleus ? 'organelle' : ''}`} 
                         style={{ ...pos, transform: mode === 'bio-quantum' ? 'translate(-50%, -50%)' : 'none' }}>
                       {sKey === 'OrderMatch' && !isContingencyMode && <Icons.brainCircuit className="h-8 w-8 text-brand-primary mb-1"/>}
                        <div className="title text-sm">{isContingencyMode && metric.status === 'Down' ? `(Bypassed) ${config.title}` : config.title}</div>
                        <div className="desc">{config.desc}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default InteractiveArchitectureDiagram;