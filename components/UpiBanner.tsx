import React from 'react';
import { User } from '../types';
import Card from './shared/Card';
import { Icons } from './Icons';

interface UpiBannerProps {
    status: User['upiAutopay']['status'];
    onStartUpi: () => void;
}

const UpiBanner: React.FC<UpiBannerProps> = ({ status, onStartUpi }) => {
    return (
        <Card className="mb-6 bg-purple-500/10 border-purple-500/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Icons.upi className="h-8 w-8 text-purple-400" />
                    <div>
                        <h3 className="font-bold text-white text-lg">
                           Your Wallet Balance is Low
                        </h3>
                        <p className="text-brand-text-secondary text-sm">
                           Enable UPI Auto Top-up for uninterrupted, PIN-less trading. Your wallet will be automatically funded when it runs low.
                        </p>
                    </div>
                </div>
                {status === 'none' && (
                    <button 
                        onClick={onStartUpi}
                        className="bg-purple-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-600 transition-colors whitespace-nowrap"
                    >
                        Enable Auto Top-up
                    </button>
                )}
                 {status === 'pending' && (
                    <div className="flex items-center space-x-2 text-brand-yellow">
                        <Icons.spinner className="animate-spin" />
                        <span>Processing...</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default UpiBanner;