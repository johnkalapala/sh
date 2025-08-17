import React from 'react';
import { Icons } from '../../Icons';
import LiveTransactionFeed from '../LiveTransactionFeed';

interface DpiOutageTestProps {
  backendState: any;
}

const DpiOutageTest: React.FC<DpiOutageTestProps> = ({ backendState }) => {
    const metrics = backendState.metrics.DPI;
    const status = metrics.status;
    const errorRate = metrics.errorRate || 0;

    const failedKycTransactions = backendState.transactions.filter((t: any) => t.type === 'KYC' && t.status === 'FAILED');

    return (
         <div>
            <div className="flex items-center space-x-3 mb-4">
                <Icons.cloudSlash className="h-8 w-8 text-brand-red" />
                <div>
                    <h2 className="text-xl font-bold text-white">DPI Service Outage</h2>
                    <p className="text-sm text-brand-text-secondary">Simulating a failure of a key component of the India Stack, such as Aadhaar e-KYC or DigiLocker for PAN verification.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">DPI Service Status</h3>
                     <div className={`p-6 rounded-lg text-center border-2 ${status === 'Down' ? 'border-brand-red bg-brand-red/10' : 'border-brand-green bg-brand-green/10'}`}>
                         <p className={`text-4xl font-bold ${status === 'Down' ? 'text-brand-red' : 'text-brand-green'}`}>{status.toUpperCase()}</p>
                     </div>
                     <div className="text-center p-4 mt-4 bg-brand-surface rounded-lg">
                        <p className="text-brand-text-secondary">KYC Verification Failure Rate</p>
                        <p className="text-3xl font-mono font-bold text-brand-red">{errorRate.toFixed(1)}%</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Failed KYC Transactions</h3>
                    <LiveTransactionFeed transactions={failedKycTransactions} limit={8} />
                </div>
            </div>
        </div>
    );
};

export default DpiOutageTest;
