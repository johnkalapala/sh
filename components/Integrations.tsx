
import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import { Icons } from './Icons';
import CodeSnippet from './shared/CodeSnippet';

interface IntegrationsProps {
    onUploadData: () => void;
}

const integrationPlan = {
    "real_sources": [
      { "source": "NSE API", "endpoint": "/market-data/debt", "format": "CSV" },
      { "source": "BSE API", "endpoint": "/corporatebond/list", "format": "JSON" },
      { "source": "NSDL", "endpoint": "/isin-search", "format": "API" },
      { "source": "SEBI", "endpoint": "/statistics/bonds", "format": "Excel" },
      { "source": "FIMMDA", "endpoint": "/cbrics-data", "format": "CSV" }
    ],
    "update_frequency": "Daily Batch",
    "quality_checks": [ "ISIN format validation", "Date standardization", "Duplicate removal", "Missing data handling" ]
};

const pythonSnippet = `import requests
import json

API_KEY = "YOUR_API_KEY_HERE"
BASE_URL = "https://api.quantumbond.exchange/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def get_bond_details(isin):
    response = requests.get(f"{BASE_URL}/bonds/{isin}", headers=headers)
    return response.json()

# Example: Get details for a Reliance bond
bond_details = get_bond_details("INE002A07018")
print(json.dumps(bond_details, indent=2))
`;

const Integrations: React.FC<IntegrationsProps> = ({ onUploadData }) => {
    const [apiKey, setApiKey] = useState('');
    
    const generateApiKey = () => {
        setApiKey(`qbe_live_${[...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`);
    };

    return (
        <div className="space-y-6">
             <Card>
                <h2 className="text-2xl font-bold">Exchange Integration & API Access</h2>
                <p className="text-brand-text-secondary mt-1">Connect QuantumBond to external platforms and build custom trading solutions with our powerful API.</p>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-semibold mb-4">Market Data Management</h3>
                    <p className="text-sm text-brand-text-secondary mb-3">Load your own bond dataset (in CSV format) to use within the platform. This will replace the initial sample market data.</p>
                    <button onClick={onUploadData} className="w-full bg-brand-secondary text-white font-semibold py-2 px-4 rounded-md hover:opacity-90">
                        Upload New Dataset
                    </button>
                </Card>
                <Card>
                    <h3 className="text-xl font-semibold mb-4">API Key Management</h3>
                    {apiKey ? (
                        <div className="space-y-3">
                            <p className="text-sm text-brand-text-secondary">Your generated API key:</p>
                            <CodeSnippet code={apiKey} language="text" />
                             <button onClick={generateApiKey} className="w-full text-sm text-brand-primary hover:underline">Regenerate Key</button>
                        </div>
                    ) : (
                         <button onClick={generateApiKey} className="w-full bg-brand-primary text-black font-semibold py-2 px-4 rounded-md hover:opacity-90">
                            Generate Live API Key
                        </button>
                    )}
                </Card>
            </div>
             <Card>
                 <h3 className="text-xl font-semibold mb-4">Production Data Integration Plan</h3>
                 <p className="text-sm text-brand-text-secondary mb-4">The platform is designed to connect to real-world data sources for production deployment. The following plan outlines the target integration points:</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-brand-bg p-4 rounded-lg border border-brand-border">
                        <h4 className="font-semibold text-white mb-2">Primary Data Sources</h4>
                        <ul className="space-y-2 text-sm">
                            {integrationPlan.real_sources.map(source => (
                                <li key={source.source} className="flex justify-between items-center">
                                    <span className="text-brand-text">{source.source}</span>
                                    <span className="font-mono text-xs bg-brand-surface px-2 py-1 rounded-md">{source.format}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="bg-brand-bg p-4 rounded-lg border border-brand-border">
                        <h4 className="font-semibold text-white mb-2">Data Pipeline & Quality</h4>
                        <div className="text-sm space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="text-brand-text">Update Frequency</span>
                                <span className="font-semibold text-brand-primary">{integrationPlan.update_frequency}</span>
                            </div>
                            <div>
                                <p className="text-brand-text">Quality Checks:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {integrationPlan.quality_checks.map(check => (
                                        <span key={check} className="text-xs bg-brand-surface px-2 py-1 rounded-full">{check}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </Card>
             <Card>
                 <h3 className="text-xl font-semibold mb-4">Developer Quickstart</h3>
                 <p className="text-sm text-brand-text-secondary mb-2">Example of querying bond data using the production API.</p>
                 <CodeSnippet code={pythonSnippet} language="python" />
            </Card>
        </div>
    );
};

export default Integrations;
