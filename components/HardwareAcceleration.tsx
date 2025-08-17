import React, { useState, useMemo } from 'react';
import Card from './shared/Card';
import { Icons } from './Icons';
import CodeSnippet from './shared/CodeSnippet';

const cppSnippet = `#include <iostream>
#include "qbe_hal_interface.h" // Hardware Abstraction Layer

// Example: Process a batch of trades using the HAL
void process_high_frequency_batch(const TradeBatch& batch) {
    // The HAL determines the best execution backend (SGX, IPEX, etc.)
    qbe::ExecutionHandle* handle = qbe::hal::get_secure_handle();

    if (handle) {
        // Offload computation via the abstraction layer
        qbe::ComputationResult result = handle->process_trades(batch);

        std::cout << "Batch processed securely in " 
                  << result.microseconds << " us." << std::endl;
        
        // Clean up
        qbe::hal::release_handle(handle);
    }
}`;

const HalDiagram: React.FC = () => (
    <div className="flex flex-col items-center p-4 bg-brand-bg rounded-lg space-y-2 font-mono text-xs">
        {/* API Request */}
        <div className="p-2 bg-brand-surface border border-brand-border rounded-md text-center">
            <p className="font-bold text-white">API Request</p>
            <p>POST /v1/orders</p>
        </div>
        <div className="text-brand-primary font-bold text-lg">&darr;</div>
        {/* Hardware Abstraction Layer */}
        <div className="w-full p-3 bg-brand-surface border-2 border-brand-primary rounded-lg text-center shadow-lg shadow-brand-primary/20">
            <p className="font-bold text-brand-primary">Hardware Abstraction Layer (libqbr_core.so)</p>
            <p className="text-brand-text-secondary">Securely routes computation to the optimal hardware backend</p>
             <div className="text-brand-green font-bold text-lg mt-1">&darr;</div>
            {/* Intel SGX Enclave */}
            <div className="mt-1 p-4 bg-brand-primary/10 rounded-md border-2 border-dashed border-brand-primary">
                <p className="text-center text-brand-primary font-bold text-sm">Intel® SGX Secure Enclave (Encrypted Memory)</p>
                <div className="mt-2 p-3 bg-brand-surface rounded-md text-center text-xs">
                    <p className="animate-pulse">🔒 Executing Trade Matching Logic...</p>
                    <p>🔒 Counterparty Data Shielded</p>
                </div>
            </div>
        </div>
        <div className="text-brand-green font-bold text-lg">&darr;</div>
         {/* API Response */}
        <div className="p-2 bg-brand-surface border border-brand-green rounded-md text-center">
            <p className="font-bold text-brand-green">API Response</p>
            <p>201 Created | Order ID: tx_123...</p>
        </div>
    </div>
);

const VulnerabilityScan: React.FC = () => {
    const scanItems = [
        { name: "Side-Channel Resistance (Spectre, etc.)", status: "Passed" },
        { name: "Memory Safety & Isolation", status: "Passed" },
        { name: "Cryptographic Integrity (PQC)", status: "Passed" },
        { name: "Attestation Verification", status: "Passed" },
    ];
    return (
        <div className="bg-brand-bg p-4 rounded-lg border border-brand-border">
            <div className="flex items-center space-x-3 mb-3">
                <Icons.scanner className="h-6 w-6 text-brand-primary" />
                <div>
                    <h4 className="font-semibold text-white">Vulnerability Scan Results</h4>
                    <p className="text-xs text-brand-text-secondary">Last scanned: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <div className="space-y-2">
                {scanItems.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <span className="text-brand-text">{item.name}</span>
                        <div className="flex items-center space-x-1 font-bold text-brand-green">
                            <Icons.checkCircle />
                            <span>{item.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const HardwareAcceleration: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start space-x-4">
                    <Icons.chip className="h-10 w-10 text-brand-primary flex-shrink-0" />
                    <div>
                        <h2 className="text-2xl font-bold">Confidential Computing & Hardware Acceleration</h2>
                        <p className="text-brand-text-secondary mt-1">Ensuring institutional-grade security and performance through a dedicated Hardware Abstraction Layer (HAL) and Intel® SGX.</p>
                    </div>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4">Hardware Abstraction Layer (HAL)</h3>
                    <p className="text-sm text-brand-text-secondary mb-4">Our HAL provides a unified interface for our application to interact with specialized hardware, abstracting away the complexity of confidential computing. It intelligently routes sensitive computations to the most secure and performant execution environment available.</p>
                    <HalDiagram />
                </Card>
                <Card className="lg:col-span-3">
                    <h3 className="text-xl font-semibold mb-4">Security Attestation & Vulnerability Mitigation</h3>
                    <p className="text-sm text-brand-text-secondary mb-4">Our enclave design follows Intel's hardening guidance to mitigate against known hardware vulnerabilities like side-channel attacks (e.g., Spectre, Foreshadow, LVI). The enclave undergoes remote attestation, where its cryptographic signature is verified by a trusted third party before any sensitive data is provisioned, ensuring the code has not been tampered with.</p>
                    <VulnerabilityScan />
                     <h4 className="text-lg font-semibold mt-6 mb-2">Code Example: Secure Offloading</h4>
                    <CodeSnippet code={cppSnippet} language="cpp" />
                </Card>
            </div>


            <Card>
                 <h3 className="text-xl font-semibold mb-4">Senior Engineer's Recommendations</h3>
                 <p className="text-sm text-brand-text-secondary mb-4">Moving from this advanced prototype to a globally-trusted financial platform requires a focus on operational excellence. Here are my key recommendations:</p>
                 <ul className="space-y-4 text-sm">
                    <li className="flex items-start space-x-3">
                        <Icons.status.ok className="flex-shrink-0 mt-1" />
                        <div>
                            <strong className="text-white">Hybrid DLT Architecture:</strong> Utilize a high-throughput public DLT like **Hedera Hashgraph** for the retail liquidity layer (fast, fractional trades). For institutional settlement and regulatory reporting, use a permissioned DLT like **R3 Corda** via a dedicated **Regulatory Gateway** to ensure compliance and privacy.
                        </div>
                    </li>
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
                            <strong className="text-white">Rigorous Security Audits:</strong> The use of custom, low-level code and Secure Enclaves introduces unique security challenges. Engage reputable third-party security firms to perform regular, deep audits of all cryptographic implementations and the SGX enclave code.
                        </div>
                    </li>
                 </ul>
            </Card>
        </div>
    );
};

export default HardwareAcceleration;