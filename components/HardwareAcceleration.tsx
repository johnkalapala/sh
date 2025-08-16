import React, { useState, useMemo } from 'react';
import Card from './shared/Card';
import { Icons } from './Icons';
import CodeSnippet from './shared/CodeSnippet';

const cppSnippet = `#include <iostream>
#include "qbe_compute_plugin.h"

// Example: Process a batch of trades using the direct compute plugin
void process_high_frequency_batch(const TradeBatch& batch) {
    // Initialize the hardware-accelerated engine
    QBEngine* engine = qbe_init_engine(COMPUTE_MODE_SGX);

    if (engine) {
        // Offload computation to the hardware plugin
        ComputationResult result = qbe_process_trades(engine, batch);

        std::cout << "Batch processed in " << result.microseconds << " us." << std::endl;
        
        // Clean up
        qbe_release_engine(engine);
    }
}`;

const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="font-semibold text-white">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-brand-primary' : 'bg-brand-bg'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);

const ResilienceLibrary: React.FC<{ icon: React.ReactNode, name: string, description: string }> = ({ icon, name, description }) => (
    <div className="flex items-start space-x-4 p-3 bg-brand-bg rounded-lg">
        <div className="flex-shrink-0 text-brand-primary">{icon}</div>
        <div>
            <h5 className="font-semibold text-white">{name}</h5>
            <p className="text-xs text-brand-text-secondary">{description}</p>
        </div>
        <div className="ml-auto flex items-center space-x-2">
            <span className="status-dot"></span>
            <span className="text-xs font-semibold text-brand-green">Active</span>
        </div>
    </div>
);


const HardwareAcceleration: React.FC = () => {
    const [pluginActive, setPluginActive] = useState(true);

    const computeBars = useMemo(() => 
        Array.from({ length: 64 }).map((_, i) => (
            <div 
                key={i} 
                className="compute-bar" 
                style={{ animationDelay: `${i * 0.02}s` }}
            />
        )), 
    []);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start space-x-4">
                    <Icons.chip className="h-10 w-10 text-brand-primary flex-shrink-0" />
                    <div>
                        <h2 className="text-2xl font-bold">Hardware Acceleration</h2>
                        <p className="text-brand-text-secondary mt-1">Leveraging direct compute plugins via Intel® oneAPI & IPEX for unparalleled performance and security at scale.</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-4">Direct Compute Plugin</h3>
                    <div className="space-y-4">
                        <ToggleSwitch label="Plugin Status" checked={pluginActive} onChange={setPluginActive} />
                        <div className={`p-4 rounded-lg border text-center transition-all duration-300 ${pluginActive ? 'bg-brand-primary/10 border-brand-primary' : 'bg-brand-bg border-brand-border'}`}>
                             <p className="text-sm font-semibold text-brand-text-secondary">PLUGIN STATUS</p>
                             <p className={`text-2xl font-bold ${pluginActive ? 'text-brand-primary' : 'text-brand-text-secondary'}`}>{pluginActive ? 'ACTIVE' : 'INACTIVE'}</p>
                        </div>
                        <div className={`p-4 rounded-lg border text-center transition-all duration-300 ${pluginActive ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-bg border-brand-border'}`}>
                             <p className="text-sm font-semibold text-brand-text-secondary">PEAK THROUGHPUT</p>
                             <p className={`text-2xl font-bold ${pluginActive ? 'text-brand-green' : 'text-brand-text-secondary'}`}>{pluginActive ? '3.2B Trades/sec' : 'N/A'}</p>
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                     <h3 className="text-xl font-semibold mb-4">Massively Parallel Trade Processing</h3>
                     <p className="text-sm text-brand-text-secondary mb-3">The compute plugin distributes trade matching and risk calculations across all available CPU cores, enabling near-instantaneous processing of immense order volumes.</p>
                     <div className="compute-bar-container">
                        {pluginActive && computeBars}
                     </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-semibold mb-4">AI Speculative Decoding</h3>
                    <p className="text-sm text-brand-text-secondary mb-4">Hardware-accelerated speculative execution for AI models reduces latency for predictive analytics and fair value calculations from seconds to milliseconds.</p>
                    <div className="text-center font-mono text-xs">
                        {/* A simple visual representation */}
                        <div className="p-2 bg-brand-bg rounded-md">Prompt</div>
                        <div className="text-brand-primary font-bold my-1">↓</div>
                        <div className="flex justify-around">
                            <div className="p-2 bg-brand-surface rounded-md border border-dashed border-brand-border">Speculative Path 1</div>
                            <div className="p-2 bg-brand-surface rounded-md border border-dashed border-brand-border">Speculative Path 2</div>
                            <div className="p-2 bg-brand-surface rounded-md border border-dashed border-brand-border">Speculative Path 3</div>
                        </div>
                        <div className="text-brand-primary font-bold my-1">↓</div>
                        <div className="p-2 bg-brand-green/20 border border-brand-green rounded-md text-brand-green">Converged Result (12ms)</div>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-xl font-semibold mb-4">Intel® SGX Secure Enclaves</h3>
                    <p className="text-sm text-brand-text-secondary mb-4">Critical trade logic and sensitive data are processed inside a hardware-level encrypted memory enclave, making them completely isolated and invisible—even to the host OS.</p>
                    <div className="p-4 bg-brand-bg rounded-lg border border-brand-border">
                        <p className="text-center text-sm font-semibold">Host System (CPU)</p>
                        <div className="mt-2 p-4 bg-brand-primary/10 rounded-md border-2 border-brand-primary">
                            <p className="text-center text-brand-primary font-bold text-sm">Intel® SGX Enclave (Encrypted Memory)</p>
                            <div className="mt-2 p-3 bg-brand-surface rounded-md text-center text-xs">
                                <p>🔒 Trade Matching Logic</p>
                                <p>🔒 Counterparty Data</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
             <Card>
                <h3 className="text-xl font-semibold mb-4">Developer Integration (CMake Plugin)</h3>
                <p className="text-sm text-brand-text-secondary mb-4">The high-performance engine is compiled as a direct plugin using CMake, allowing for low-level, high-speed integration from any C++ compatible system.</p>
                <CodeSnippet code={cppSnippet} language="cpp" />
            </Card>

            <Card>
                <h3 className="text-xl font-semibold mb-4">QuantumBond Resilience Suite</h3>
                <p className="text-sm text-brand-text-secondary mb-4">A suite of specialized, low-level libraries ensuring the entire hardware-accelerated framework is fault-tolerant and production-ready.</p>
                <div className="space-y-3">
                    <ResilienceLibrary icon={<Icons.cogs />} name="libqbr_core.so" description="Manages redundant compute nodes and orchestrates seamless failover between hardware resources." />
                    <ResilienceLibrary icon={<Icons.database />} name="libqbr_integrity.so" description="Ensures end-to-end data integrity using cryptographic hashes and checksums at the hardware level." />
                    <ResilienceLibrary icon={<Icons.shieldNodes />} name="libqbr_failover.so" description="Handles graceful degradation from Bio-Quantum to Standard mode in case of critical hardware or API failure." />
                    <ResilienceLibrary icon={<Icons.heartbeat />} name="libqbr_monitor.so" description="Provides a constant stream of low-level telemetry for health monitoring and predictive maintenance." />
                </div>
            </Card>

            <Card>
                 <h3 className="text-xl font-semibold mb-4">Senior Engineer's Recommendations</h3>
                 <p className="text-sm text-brand-text-secondary mb-4">Moving from this advanced prototype to a globally-trusted financial platform requires a focus on operational excellence. Here are my key recommendations:</p>
                 <ul className="space-y-4 text-sm">
                    <li className="flex items-start space-x-3">
                        <Icons.status.ok className="flex-shrink-0 mt-1" />
                        <div>
                            <strong className="text-white">Extreme Redundancy:</strong> Deploy the entire stack across multiple, geographically distinct cloud regions (e.g., Mumbai, Hyderabad). Implement automated, region-level failover to ensure zero downtime during a regional outage.
                        </div>
                    </li>
                     <li className="flex items-start space-x-3">
                        <Icons.status.ok className="flex-shrink-0 mt-1" />
                        <div>
                            <strong className="text-white">Phased & Canary Rollouts:</strong> Never deploy new quantum algorithms or major AI model updates to all users at once. Use canary releases to expose new features to a small percentage of traffic, monitoring for performance and accuracy before a full rollout.
                        </div>
                    </li>
                     <li className="flex items-start space-x-3">
                        <Icons.status.ok className="flex-shrink-0 mt-1" />
                        <div>
                            <strong className="text-white">Deep Observability with Distributed Tracing:</strong> Implement a system like OpenTelemetry to trace every single request from the user's click, through the API gateway, to the quantum engine, and to the DLT. This is non-negotiable for debugging in such a complex, distributed system.
                        </div>
                    </li>
                     <li className="flex items-start space-x-3">
                        <Icons.status.ok className="flex-shrink-0 mt-1" />
                        <div>
                            <strong className="text-white">Rigorous Security Audits:</strong> The use of custom, low-level code and Secure Enclaves introduces unique security challenges. Engage reputable third-party security firms to perform regular, deep audits of all cryptographic implementations and the SGX enclave code.
                        </div>
                    </li>
                 </ul>
            </Card>
        </div>
    );
};

export default HardwareAcceleration;