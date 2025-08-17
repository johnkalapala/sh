import React from 'react';
import { Icons } from './Icons';

const CircuitBreakerBanner: React.FC = () => {
    return (
        <div className="bg-brand-red text-white font-semibold p-2 text-center flex items-center justify-center space-x-3 w-full z-50 animate-pulse">
            <Icons.pause className="h-5 w-5" />
            <span>
                Market Circuit Breaker Tripped: Trading is temporarily halted due to extreme volatility.
            </span>
        </div>
    );
};

export default CircuitBreakerBanner;