
import React from 'react';
import { TransactionEvent } from '../../types';

interface LiveTransactionFeedProps {
  transactions: TransactionEvent[];
  limit?: number;
}

const getStatusColor = (status: TransactionEvent['status']) => {
  switch (status) {
    case 'SUCCESS': return 'text-brand-green';
    case 'PENDING': return 'text-brand-yellow';
    case 'FAILED': return 'text-brand-red';
    default: return 'text-brand-text-secondary';
  }
};

const getTypeColor = (type: TransactionEvent['type']) => {
  switch (type) {
    case 'ORDER': return 'border-l-brand-primary';
    case 'SETTLEMENT': return 'border-l-brand-yellow';
    case 'KYC': return 'border-l-purple-500';
    default: return 'border-l-brand-text-secondary';
  }
}

const LiveTransactionFeed: React.FC<LiveTransactionFeedProps> = ({ transactions, limit }) => {
  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className={`bg-brand-bg rounded-lg p-2 space-y-2 ${!limit ? 'h-[520px] overflow-y-auto' : ''}`}>
      {displayedTransactions.length > 0 ? displayedTransactions.map(tx => (
        <div key={tx.id} className={`p-2 bg-brand-surface rounded-md border-l-2 ${getTypeColor(tx.type)}`}>
          <div className="flex justify-between items-start">
            <div>
                <span className="font-semibold text-xs text-brand-text">{tx.type}</span>
                <p className="text-xs text-brand-text-secondary truncate pr-2">{tx.details}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <span className={`text-xs font-bold ${getStatusColor(tx.status)}`}>{tx.status}</span>
                <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
           {tx.dltHash && (
                <div className="mt-1 pt-1 border-t border-brand-border">
                    <p className="text-xs text-purple-400 font-mono truncate" title={tx.dltHash}>DLT Hash: {tx.dltHash.substring(0, 20)}...</p>
                </div>
            )}
        </div>
      )) : (
        <div className="flex items-center justify-center h-full">
            <p className="text-brand-text-secondary">No recent transactions...</p>
        </div>
      )}
    </div>
  );
};

export default LiveTransactionFeed;
