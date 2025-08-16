import React from 'react';
import { Icons } from './Icons';

const ContingencyBanner: React.FC = () => {
    return (
        <div className="bg-brand-yellow text-black font-semibold p-2 text-center flex items-center justify-center space-x-3 w-full z-50">
            <Icons.zap className="h-5 w-5" />
            <span>
                Operating in Standard Mode. Advanced Quantum & AI features are temporarily unavailable.
            </span>
        </div>
    );
};

export default ContingencyBanner;