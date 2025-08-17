
import React from 'react';
import { AnalyticsLog } from '../../types';

interface AnalyticsEngineLogProps {
  logs: AnalyticsLog[];
  limit?: number;
}

const getMessageColor = (log: AnalyticsLog) => {
    switch (log.service) {
        case 'Pricing':
            return log.message.includes('Cache HIT') ? 'text-green-400' : 'text-yellow-400';
        case 'AIS':
            return 'text-red-400';
        case 'Swarm':
            return 'text-blue-400';
        default:
            return 'text-gray-400';
    }
};

const AnalyticsEngineLog: React.FC<AnalyticsEngineLogProps> = ({ logs, limit }) => {
  const displayedLogs = limit ? logs.slice(0, limit) : logs;
  return (
    <div className={`bg-brand-bg rounded-lg p-2 space-y-2 text-xs font-mono ${!limit ? 'h-[520px] overflow-y-auto' : ''}`}>
      {displayedLogs.length > 0 ? displayedLogs.map(log => (
        <div key={log.id} className="p-1">
          <span className="text-cyan-400">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
           <span className="text-brand-text-secondary mx-1">-</span>
          <span className={`${getMessageColor(log)}`}>
            [{log.service}] {log.message}
          </span>
        </div>
      )): (
        <div className="flex items-center justify-center h-full">
            <p className="text-brand-text-secondary">No recent analysis logs...</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsEngineLog;
