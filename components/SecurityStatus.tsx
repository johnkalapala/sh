import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { ScenarioType } from '../types';

interface SecurityStatusProps {
    activeScenario: ScenarioType;
    isContingencyMode: boolean;
}

const SecurityStatus: React.FC<SecurityStatusProps> = ({ activeScenario, isContingencyMode }) => {
    const [integrity, setIntegrity] = useState(99.98);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate the integrity score slightly to give a "live" feel
            const fluctuation = (Math.random() - 0.5) * 0.02;
            setIntegrity(prev => {
                const newValue = prev + fluctuation;
                if (newValue > 100) return 100;
                if (newValue < 99.9) return 99.9;
                return newValue;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const isUnderAttack = activeScenario === 'API_GATEWAY_OVERLOAD';

    if (isContingencyMode) {
        return (
             <div 
                className={`hidden lg:flex items-center space-x-3 bg-brand-bg border border-brand-border px-3 py-1.5 rounded-lg transition-all duration-300`} 
                title="System is operating with standard security protocols."
            >
                <Icons.shield className={`transition-colors duration-300 text-brand-yellow`} />
                <div className="text-sm">
                    <span className="text-brand-text-secondary">Security:</span>
                    <span className="ml-2 font-mono font-bold text-brand-yellow">Standard</span>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`hidden lg:flex items-center space-x-3 bg-brand-bg border border-brand-border px-3 py-1.5 rounded-lg transition-all duration-300 ${isUnderAttack ? 'border-brand-red animate-glow-red' : ''}`} 
            title="System security is actively monitored by a bio-inspired Artificial Immune System (AIS) and protected with Post-Quantum Cryptography (PQC)."
        >
            <Icons.shieldCheck className={`transition-colors duration-300 ${isUnderAttack ? 'text-brand-red' : 'text-brand-primary'}`} />
            <div className="text-sm">
                <span className="text-brand-text-secondary">System Integrity:</span>
                {isUnderAttack ? (
                     <span className="ml-2 font-mono font-bold text-brand-red animate-pulse">MITIGATING</span>
                 ) : (
                    <span className="ml-2 font-mono font-bold text-brand-primary animate-security-glow">{integrity.toFixed(2)}%</span>
                 )}
            </div>
        </div>
    );
};

export default SecurityStatus;