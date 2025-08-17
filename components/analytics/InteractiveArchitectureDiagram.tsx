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
    RegulatoryGateway: { top: '5%', left: '50%' },
};

const STANDARD_POSITIONS: Record<ServiceName, Required<ServicePosition>> = {
    UserIntf: { top: '5%', left: '35%', width: '30%', height: '15%' },
    DPI: { top: '5%', left: '70%', width: '25%', height: '15%' },
    APIGW: { top: '25%', left: '5%', width: '25%', height: '15%' },
    OrderMatch: { top: '45%', left: '37.5%', width: '25%', height: '15%' },
    TokenizSvc: { top: '25%', left: '70%', width: '25%', height: '15%' },
    Pricing: { top: '65%', left: '5%', width: '25%', height: '15%' },
    HederaHashgraph: { top: '80%', left: '20%', width: '25%', height: '15%' },
    RegulatoryGateway: { top: '80%', left: '55%', width: '25%', height: '15%' },
};

const PATHS = {
    BIO_QUANTUM: [
        { from: 'UserIntf', to: 'APIGW' },
        { from: 'APIGW', to: 'OrderMatch' },
        { from: 'OrderMatch', to: 'TokenizSvc' },
        { from: 'TokenizSvc', to: 'HederaHashgraph' },
        { from: 'OrderMatch', to: 'HederaHashgraph' },
        { from: 'OrderMatch', to: 'Pricing' },
        { from: 'HederaHashgraph', to: 'RegulatoryGateway' },
        { from: 'UserIntf', to: 'DPI' },
    ],
    STANDARD: [
        { from: 'UserIntf', to: 'DPI' },
        { from: 'UserIntf', to: 'APIGW' },
        { from: 'APIGW', to: 'OrderMatch' },
        { from: 'OrderMatch', to: 'TokenizSvc' },
        { from: 'TokenizSvc', to: 'HederaHashgraph' },
        { from: 'HederaHashgraph', to: 'RegulatoryGateway' },
        { from: 'OrderMatch', to: 'Pricing' },
    ]
};


const SERVICE_CONFIG: Record<ServiceName, { title: string; desc: string }> = {
    UserIntf: { title: 'User Interface', desc: 'Retail & Institutional' },
    DPI: { title: 'DPI Aadhaar', desc: 'e-KYC Verification' },
    APIGW: { title: 'Membrane Gateway', desc: 'AIS Security' },
    OrderMatch: { title: 'Quantum Nucleus', desc: 'AI Liquidity Discovery' },
    TokenizSvc: { title: 'Tokenization Svc', desc: 'Security Token Minting' },
    Pricing: { title: 'Quantum Oracle', desc: 'Enhanced Pricing' },
    HederaHashgraph: { title: 'Retail Settlement', desc: 'Hedera Hashgraph DLT' },
    RegulatoryGateway: { title: 'Regulatory Gateway', desc: 'Compliance & Reporting' },
};


const InteractiveArchitectureDiagram: React.FC<DiagramProps> = ({ metrics, isContingencyMode, activeScenario }) => {
    const mode = isContingencyMode ? 'standard' : 'bio-quantum';
    const positions = isContingencyMode ? STANDARD_POSITIONS : BIO_QUANTUM_POSITIONS;
    const paths = isContingencyMode ? PATHS.STANDARD : BIO_QUANTUM_POSITIONS;
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
             {/* Institutional / Permissioned DLT Layer */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-1/4 bg-purple-500/5 rounded-lg border border-dashed border-purple-500/50 flex items-end justify-center pb-2 text-purple-400 font-semibold text-sm">
                Institutional & Regulatory Loop (Permissioned DLT)
            </div>

            <svg className="svg-overlay">
                {!isContingencyMode && (
                    <ellipse
                        cx="50%" cy="50%" rx="48%" ry="45%"
                        className={`transition-all duration-500 ${isUnderAttack ? 'stroke-brand-red animate-glow-red' : 'stroke-brand-primary animate-membrane'}`}
                        fill="none"
                    />
                )}
            </svg>

            {Object.entries(positions).map(([key, pos]) => {
                const sKey = key as ServiceName;
                if (!metrics[sKey]) return null;
                const metric = metrics[sKey];
                const config = SERVICE_CONFIG[sKey];
                const statusClass = metric.status === 'Down' ? 'status-down' : '';
                const modeStatusClass = isContingencyMode ? 'status-standard' : '';
                const isNucleus = sKey === 'OrderMatch';
                const isRegulatory = sKey === 'RegulatoryGateway';

                return (
                    <div key={key} id={`arch-${key}`} 
                         className={`arch-block ${statusClass} ${modeStatusClass} ${!isContingencyMode && !isNucleus ? 'organelle' : ''} ${isRegulatory ? 'border-purple-500' : ''}`} 
                         style={{ ...pos, transform: mode === 'bio-quantum' ? 'translate(-50%, -50%)' : 'none' }}>
                       {sKey === 'OrderMatch' && !isContingencyMode && <Icons.brainCircuit className="h-8 w-8 text-brand-primary mb-1"/>}
                       {isRegulatory && <Icons.shieldNodes className="h-8 w-8 text-purple-400 mb-1"/>}
                        <div className={`title text-sm ${isRegulatory ? 'text-purple-400' : ''}`}>{isContingencyMode && metric.status === 'Down' ? `(Bypassed) ${config.title}` : config.title}</div>
                        <div className="desc">{config.desc}</div>
                    </div>
                );
            })}
             {/* Extra node for Permissioned DLT */}
            <div 
                className={`arch-block ${isContingencyMode ? 'status-standard' : ''} border-purple-500`} 
                style={isContingencyMode 
                    ? { top: '65%', left: '72%', width: '25%', height: '15%' } 
                    : { top: '25%', left: '50%', transform: 'translate(-50%,-50%)' }
                }>
                 <Icons.database className="h-8 w-8 text-purple-400 mb-1"/>
                <div className="title text-sm text-purple-400">Permissioned DLT</div>
                <div className="desc">e.g., R3 Corda</div>
            </div>
        </div>
    );
};

export default InteractiveArchitectureDiagram;