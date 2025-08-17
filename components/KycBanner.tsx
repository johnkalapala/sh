import React from 'react';
import { User } from '../types';
import Card from './shared/Card';
import { Icons } from './Icons';

interface KycBannerProps {
    status: User['kyc']['status'];
    onStartKyc: () => void;
}

const KycBanner: React.FC<KycBannerProps> = ({ status, onStartKyc }) => {
    return (
        <Card className="mb-6 bg-brand-secondary/20 border-brand-secondary">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Icons.shield className="h-8 w-8 text-brand-primary" />
                    <div>
                        <h3 className="font-bold text-white text-lg">
                            {status === 'pending' ? 'KYC Verification Pending' : 'Complete Your KYC Verification'}
                        </h3>
                        <p className="text-brand-text-secondary text-sm">
                            {status === 'pending' 
                                ? 'Your identity is being verified via our DPI partner. This may take a moment.' 
                                : "To enable trading, please complete your one-time identity verification using Aadhaar, PAN, and Bank details via India's DPI Stack."}
                        </p>
                    </div>
                </div>
                {status === 'unverified' && (
                    <button 
                        onClick={onStartKyc}
                        className="bg-brand-primary text-black font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity"
                    >
                        Verify Identity
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

export default KycBanner;