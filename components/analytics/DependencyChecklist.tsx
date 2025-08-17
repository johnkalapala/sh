import React from 'react';
import { Icons } from '../Icons';

interface DependencyChecklistProps {
    isContingencyMode: boolean;
    isTestView?: boolean;
}

const DependencyItem: React.FC<{ name: string; status: 'Online' | 'Offline'; fallback: string }> = ({ name, status, fallback }) => (
    <div className="grid grid-cols-12 gap-4 items-center p-3 border-b border-brand-border last:border-b-0">
        <div className="col-span-3 font-semibold text-white">{name}</div>
        <div className={`col-span-2 flex items-center space-x-2 font-semibold ${status === 'Online' ? 'text-brand-green' : 'text-brand-red'}`}>
            {status === 'Online' ? <Icons.status.ok /> : <Icons.status.error />}
            <span>{status}</span>
        </div>
        <div className="col-span-7 text-sm text-brand-text-secondary">{fallback}</div>
    </div>
);

const DependencyChecklist: React.FC<DependencyChecklistProps> = ({ isContingencyMode, isTestView = false }) => {
    return (
        <div>
            {!isTestView && (
                 <div className="mb-6">
                    <h2 className="text-2xl font-bold">Dependencies & Fallbacks</h2>
                    <p className="text-brand-text-secondary mt-1">This checklist outlines the critical external and internal services required for advanced functionality and the contingency plans in place.</p>
                </div>
            )}
           
            <div className="bg-brand-surface rounded-lg border border-brand-border">
                <div className="grid grid-cols-12 gap-4 p-3 border-b border-brand-border font-bold text-brand-text-secondary text-sm">
                    <div className="col-span-3">Component / Service</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-7">Fallback Procedure</div>
                </div>
                 <DependencyItem 
                    name="Quantum Processing Unit (QPU) Link"
                    status={isContingencyMode ? 'Offline' : 'Online'}
                    fallback="System reverts to Standard operational mode. All Quantum-enhanced features (pricing, optimization) are disabled and replaced with classical algorithms."
                />
                 <DependencyItem 
                    name="Gemini API"
                    status={isContingencyMode ? 'Offline' : 'Online'}
                    fallback="AI-driven analysis and reports are disabled. Market data is sourced from standard feeds."
                />
                 <DependencyItem 
                    name="Bio-Inspired AIS & Swarm Engines"
                    status={isContingencyMode ? 'Offline' : 'Online'}
                    fallback="System reverts to standard rule-based security and order routing. Adaptive and self-healing capabilities are disabled."
                />
                <DependencyItem 
                    name="Hedera Hashgraph DLT"
                    status={isContingencyMode ? 'Offline' : 'Online'}
                    fallback="Settlement is rerouted through a traditional centralized clearing house. Transaction immutability and speed may be affected."
                />
                 <DependencyItem 
                    name="DPI (Aadhaar e-KYC)"
                    status={'Online'}
                    fallback="If DPI services are unavailable, new user onboarding and KYC verification will be temporarily suspended. Existing verified users can continue to trade."
                />
            </div>
             {isTestView && (
                 <div className="mt-6 text-center bg-brand-bg p-4 rounded-lg">
                    <h3 className="font-semibold text-lg text-brand-yellow">Contingency Mode Active</h3>
                    <p className="text-brand-text-secondary">The system has gracefully degraded to its Standard Operational Mode. Core trading functionality remains online using traditional, resilient methods.</p>
                </div>
            )}
        </div>
    );
};

export default DependencyChecklist;
