import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import { Icons } from './Icons';
import CodeSnippet from './shared/CodeSnippet';

interface IntegrationsProps {
    onUploadData: () => void;
}

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

const jsSnippet = `const API_KEY = "YOUR_API_KEY_HERE";
const BASE_URL = "https://api.quantumbond.exchange/v1";

async function placeTrade(isin, quantity, side) {
  const response = await fetch(\`\${BASE_URL}/orders\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      isin: isin,
      quantity: quantity,
      side: side // 'BUY' or 'SELL'
    })
  });
  return await response.json();
}

// Example: Buy 100 units of an HDFC Bank bond
placeTrade("INE040A07197", 100, "BUY")
  .then(order => console.log('Order placed:', order));
`;

const upiMandateSnippet = `const API_KEY = "YOUR_API_KEY_HERE";
const BASE_URL = "https://api.quantumbond.exchange/v1";

async function createUpiMandate(userId, maxAmount) {
  const response = await fetch(\`\${BASE_URL}/mandates/upi\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      maxAmount: maxAmount, // e.g., 500000 for 5 Lakh INR
      frequency: "AS_PRESENTED"
    })
  });
  // This will return a deeplink to be opened in the user's UPI app
  return await response.json();
}

// Example: Create a 5 Lakh mandate for a user
createUpiMandate("user-12345", 500000)
  .then(mandate => console.log('UPI Mandate request created:', mandate));
`;

const Integrations: React.FC<IntegrationsProps> = ({ onUploadData }) => {
    const [apiKey, setApiKey] = useState('');
    const [apiLog, setApiLog] = useState<string[]>([]);
    
    const generateApiKey = () => {
        setApiKey(`qbe_live_${[...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const methods = ['GET', 'POST', 'GET', 'POST'];
            const paths = ['/v1/bonds/INE002A07018', '/v1/orders', '/v1/bonds/INE040A07197', '/v1/mandates/upi'];
            const statuses = ['200 OK', '201 Created', '404 Not Found', '201 Created'];
            const latency = (Math.random() * 80 + 20).toFixed(0);
            
            const randomIndex = Math.floor(Math.random()*4)
            const randomLog = `${new Date().toLocaleTimeString()} - ${methods[randomIndex]} ${paths[randomIndex]} - ${statuses[randomIndex]} (${latency}ms)`;

            setApiLog(prev => [randomLog, ...prev].slice(0, 50));
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
             <Card>
                <h2 className="text-2xl font-bold">Exchange Integration & API Access</h2>
                <p className="text-brand-text-secondary mt-1">Connect QuantumBond to external platforms and build custom trading solutions with our powerful API.</p>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <h3 className="text-xl font-semibold mb-4">Market Data Management</h3>
                        <p className="text-sm text-brand-text-secondary mb-3">Load your own bond dataset (in CSV format) to use within the platform. This will replace any existing market data.</p>
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
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4">Live API Call Log</h3>
                    <div className="bg-brand-bg p-2 rounded-md h-[450px] overflow-y-auto font-mono text-xs text-brand-text-secondary space-y-1">
                        {apiLog.map((log, i) => (
                            <p key={i} className="whitespace-pre-wrap">{log}</p>
                        ))}
                    </div>
                </Card>
            </div>
             <Card>
                 <h3 className="text-xl font-semibold mb-4">Developer Quickstart</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2">Query Bond Data (Python)</h4>
                        <CodeSnippet code={pythonSnippet} language="python" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Place an Order (JavaScript)</h4>
                        <CodeSnippet code={jsSnippet} language="javascript" />
                    </div>
                 </div>
            </Card>
        </div>
    );
};

export default Integrations;
