
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
    Kafka: { top: '0', left: '0', width: '0', height: '0' },
    AggregationSvc: { top: '0', left: '0', width: '0', height: '0' },
    OrderMatchShard1: { top: '0', left: '0', width: '0', height: '0' },
    OrderMatchShard2: { top: '0', left: '0', width: '0', height: '0' },
    OrderMatchShard3: { top: '0', left: '0', width: '0', height: '0' },
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
    Kafka: { top: '0', left: '0', width: '0', height: '0' }, AggregationSvc: { top: '0', left: '0', width: '0', height: '0' }, OrderMatchShard1: { top: '0', left: '0', width: '0', height: '0' }, OrderMatchShard2: { top: '0', left: '0', width: '0', height: '0' }, OrderMatchShard3: { top: '0', left: '0', width: '0', height: '0' }
};

const SCALABILITY_POSITIONS: Record<ServiceName, Required<ServicePosition>> = {
    UserIntf: { top: '5%', left: '5%', width: '20%', height: '12%' },
    DPI: { top: '5%', left: '75%', width: '20%', height: '12%' },
    APIGW: { top: '20%', left: '40%', width: '20%', height: '12%' },
    Kafka: { top: '35%', left: '40%', width: '20%', height: '12%' },
    OrderMatchShard1: { top: '50%', left: '5%', width: '25%', height: '15%' },
    OrderMatchShard2: { top: '50%', left: '37.5%', width: '25%', height: '15%' },
    OrderMatchShard3: { top: '50%', left: '70%', width: '25%', height: '15%' },
    AggregationSvc: { top: '70%', left: '40%', width: '20%', height: '12%' },
    RegulatoryGateway: { top: '85%', left: '15%', width: '30%', height: '12%' },
    HederaHashgraph: { top: '85%', left: '55%', width: '30%', height: '12%' },
    // Hide unused services
    OrderMatch: { top: '0', left: '0', width: '0', height: '0' },
    Pricing: { top: '0', left: '0', width: '0', height: '0' },
    TokenizSvc: { top: '0', left: '0', width: '0', height: '0' },
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
    Kafka: { title: 'Message Queue', desc: 'Apache Kafka' },
    AggregationSvc: { title: 'Aggregation Svc', desc: 'Trade Data Processing' },
    OrderMatchShard1: { title: 'Matching Engine', desc: 'Shard 1 (PSU/Infra)' },
    OrderMatchShard2: { title: 'Matching Engine', desc: 'Shard 2 (Financials)' },
    OrderMatchShard3: { title: 'Matching Engine', desc: 'Shard 3 (Corp/Other)' },
};


const InteractiveArchitectureDiagram: React.FC<DiagramProps> = ({ metrics, isContingencyMode, activeScenario }) => {
    const isScalabilityTest = activeScenario === 'SCALE_TEST';
    const mode = isScalabilityTest ? 'scalability' : isContingencyMode ? 'standard' : 'bio-quantum';
    
    let positions: Record<ServiceName, ServicePosition>;
    if (isScalabilityTest) positions = SCALABILITY_POSITIONS;
    else if (isContingencyMode) positions = STANDARD_POSITIONS;
    else positions = BIO_QUANTUM_POSITIONS;
    
    const isUnderAttack = activeScenario === 'API_GATEWAY_OVERLOAD';

    return (
        <div className={`arch-container ${mode}`}>
            {mode === 'bio-quantum' && (
                <>
                    {/* Institutional / Permissioned DLT Layer */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-1/4 bg-purple-500/5 rounded-lg border border-dashed border-purple-500/50 flex items-end justify-center pb-2 text-purple-400 font-semibold text-sm">
                        Institutional & Regulatory Loop (Permissioned DLT)
                    </div>

                    <svg className="svg-overlay">
                        <ellipse
                            cx="50%" cy="50%" rx="48%" ry="45%"
                            className={`transition-all duration-500 ${isUnderAttack ? 'stroke-brand-red animate-glow-red' : 'stroke-brand-primary animate-membrane'}`}
                            fill="none"
                        />
                    </svg>
                </>
            )}

            {Object.entries(positions).map(([key, pos]) => {
                const sKey = key as ServiceName;
                if (!metrics[sKey] || (pos.width === '0' || (pos.width === undefined && mode !== 'bio-quantum'))) return null;
                const metric = metrics[sKey];
                const config = SERVICE_CONFIG[sKey];
                let statusClass = metric.status === 'Down' ? 'status-down' : '';
                if (isScalabilityTest && metric.status === 'Active') statusClass = 'status-ok'
                
                const modeStatusClass = isContingencyMode ? 'status-standard' : '';
                const isNucleus = sKey === 'OrderMatch';
                const isRegulatory = sKey === 'RegulatoryGateway';

                let valueDisplay = `${metric.value.toLocaleString(undefined, {maximumFractionDigits: 0})} ${metric.unit}`;
                if (sKey === 'Kafka' && metric.bufferSize) {
                   valueDisplay = `Buffer: ${(metric.bufferSize / 1000).toFixed(1)}k`;
                }


                return (
                    <div key={key} id={`arch-${key}`} 
                         className={`arch-block ${statusClass} ${modeStatusClass} ${!isContingencyMode && !isNucleus ? 'organelle' : ''} ${isRegulatory ? 'border-purple-500' : ''}`} 
                         style={{ ...pos, transform: mode === 'bio-quantum' ? 'translate(-50%, -50%)' : 'none' }}>
                       {sKey === 'OrderMatch' && !isContingencyMode && <Icons.brainCircuit className="h-8 w-8 text-brand-primary mb-1"/>}
                       {isRegulatory && <Icons.shieldNodes className="h-8 w-8 text-purple-400 mb-1"/>}
                        <div className={`title text-sm ${isRegulatory ? 'text-purple-400' : ''}`}>{isContingencyMode && metric.status === 'Down' ? `(Bypassed) ${config.title}` : config.title}</div>
                        <div className="desc">{config.desc}</div>
                        {isScalabilityTest && <div className="metric-value text-xs mt-1">{valueDisplay}</div>}
                    </div>
                );
            })}
             {/* Extra node for Permissioned DLT (in bio-quantum mode) */}
            {mode === 'bio-quantum' && (
                <div 
                    className={`arch-block border-purple-500`} 
                    style={{ top: '25%', left: '50%', transform: 'translate(-50%,-50%)' }}
                >
                    <Icons.database className="h-8 w-8 text-purple-400 mb-1"/>
                    <div className="title text-sm text-purple-400">Permissioned DLT</div>
                    <div className="desc">e.g., R3 Corda</div>
                </div>
            )}
        </div>
    );
};

export default InteractiveArchitectureDiagram;
