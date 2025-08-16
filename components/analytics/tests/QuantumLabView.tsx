import React, { useState } from 'react';
import { generateQuantumSimulationAnalysis } from '../../../services/geminiService';
import { Icons } from '../../Icons';
import Spinner from '../../shared/Spinner';

const QuantumLabView: React.FC = () => {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('annealing');
    const [simulationResult, setSimulationResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const algorithms = [
        { id: 'annealing', name: 'Quantum Annealing', useCase: 'Portfolio Optimization' },
        { id: 'vqe', name: 'Variational Quantum Eigensolver', useCase: 'Complex Bond Pricing' },
        { id: 'qmc', name: 'Quantum Monte Carlo (QAE)', useCase: 'Market Risk Analysis' },
    ];

    const handleRunSimulation = async () => {
        setIsLoading(true);
        setSimulationResult('');
        try {
            const result = await generateQuantumSimulationAnalysis(selectedAlgorithm);
            setSimulationResult(result);
        } catch (error) {
            console.error(error);
            setSimulationResult('Error running simulation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="h-full flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
                <Icons.gemini className="h-8 w-8 text-brand-primary" />
                <div>
                    <h2 className="text-xl font-bold text-white">Quantum Algorithm Simulation</h2>
                    <p className="text-sm text-brand-text-secondary">Exploring Phase 3 capabilities for advanced financial modeling.</p>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-semibold">Algorithm Selector</h3>
                    <div className="space-y-2">
                        {algorithms.map(algo => (
                            <button 
                                key={algo.id}
                                onClick={() => setSelectedAlgorithm(algo.id)}
                                className={`w-full text-left p-3 rounded-md border-2 transition-all ${selectedAlgorithm === algo.id ? 'bg-brand-primary/20 border-brand-primary' : 'bg-brand-surface border-brand-border hover:border-brand-text-secondary'}`}
                            >
                                <p className="font-bold text-white">{algo.name}</p>
                                <p className="text-sm text-brand-text-secondary">{algo.useCase}</p>
                            </button>
                        ))}
                    </div>
                    <button onClick={handleRunSimulation} disabled={isLoading} className="w-full bg-brand-primary text-black py-2.5 px-4 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                        {isLoading ? <><Icons.spinner className="animate-spin" /><span>Running on QPU...</span></> : <span>Run Simulation</span>}
                    </button>
                    <div className="border-t border-brand-border pt-4">
                        <h3 className="text-lg font-semibold mb-2">Post-Quantum Cryptography</h3>
                        <p className="text-sm text-brand-text-secondary mb-3">Our platform is secured with CRYSTALS-Kyber, an NIST-standardized PQC algorithm, to protect against threats from future quantum computers.</p>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-brand-surface rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">Simulation Results</h3>
                     <div className="h-[300px] overflow-y-auto">
                        {isLoading ? <Spinner /> : (
                            <div 
                                className="gemini-analysis text-brand-text-secondary" 
                                dangerouslySetInnerHTML={{ __html: simulationResult || 'Select an algorithm and run a simulation.' }} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuantumLabView;
