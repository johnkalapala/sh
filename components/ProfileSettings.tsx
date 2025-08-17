import React from 'react';
import { User } from '../types';
import Card from './shared/Card';
import { Icons } from './Icons';
import WalletAndFunds from './WalletAndFunds';

interface ProfileSettingsProps {
  user: User;
  onOpenUpiModal: () => void;
  onOpenAddFundsModal: () => void;
}

const VerificationItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    status: 'verified' | 'unverified' | 'pending';
    user: User;
}> = ({ icon, title, description, status, user }) => {
    const statusMap = {
        verified: { text: 'Verified', color: 'text-brand-green', icon: <Icons.checkCircle /> },
        unverified: { text: 'Not Verified', color: 'text-brand-red', icon: <Icons.status.error /> },
        pending: { text: 'Pending', color: 'text-brand-yellow', icon: <Icons.spinner className="animate-spin" /> },
    };
    const currentStatus = statusMap[status === 'verified' ? 'verified' : user.kyc.status === 'pending' ? 'pending' : 'unverified'];

    return (
        <div className="flex items-center justify-between p-4 border-b border-brand-border last:border-b-0">
            <div className="flex items-center space-x-4">
                <div className="text-brand-primary">{icon}</div>
                <div>
                    <h4 className="font-semibold text-white">{title}</h4>
                    <p className="text-sm text-brand-text-secondary">{description}</p>
                </div>
            </div>
            <div className={`flex items-center space-x-2 font-semibold text-sm ${currentStatus.color}`}>
                {currentStatus.icon}
                <span>{currentStatus.text}</span>
            </div>
        </div>
    );
};


const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onOpenUpiModal, onOpenAddFundsModal }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4">Identity Verification (DPI)</h3>
                     <div className="bg-brand-bg rounded-lg border border-brand-border">
                        <VerificationItem
                            icon={<Icons.shieldCheck />}
                            title="Aadhaar e-KYC"
                            description="Identity verified via UIDAI"
                            status={user.kyc.aadhaar}
                            user={user}
                        />
                         <VerificationItem
                            icon={<Icons.panCard />}
                            title="PAN Verification"
                            description="Financial identity verified via DigiLocker"
                            status={user.kyc.pan}
                            user={user}
                        />
                         <VerificationItem
                            icon={<Icons.bank />}
                            title="Bank Account"
                            description="Verified via Penny Drop"
                            status={user.kyc.bank}
                            user={user}
                        />
                     </div>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <WalletAndFunds user={user} onAddFunds={onOpenAddFundsModal} />
                    </Card>
                     <Card>
                        <h3 className="text-xl font-semibold mb-2">Payment Settings</h3>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                                <Icons.upi className="text-purple-400" />
                                <div>
                                    <p className="font-semibold text-white">UPI Auto Top-up</p>
                                    <p className={`text-sm font-semibold ${user.upiAutopay.status === 'active' ? 'text-brand-green' : 'text-brand-text-secondary'}`}>{user.upiAutopay.status === 'active' ? 'Enabled' : 'Disabled'}</p>
                                </div>
                             </div>
                             <button onClick={onOpenUpiModal} className="text-sm bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-primary font-semibold py-1 px-3 rounded-md transition-colors">
                                {user.upiAutopay.status === 'active' ? 'Manage' : 'Enable'}
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;