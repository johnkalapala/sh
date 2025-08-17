
import React, { useState } from 'react';
import { Icons } from './Icons';

interface KycModalProps {
  onClose: () => void;
  onKycSubmit: () => void;
}

const KycModal: React.FC<KycModalProps> = ({ onClose, onKycSubmit }) => {
  const [step, setStep] = useState(1);
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [pan, setPan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onKycSubmit();
      onClose();
    }, 1500);
  };

  const renderStep = () => {
    switch(step) {
      case 1: // Aadhaar
        return (
           <div className="mt-6 text-left">
              <label className="text-sm text-brand-text-secondary">Enter your 12-digit Aadhaar Number</label>
              <input 
                  type="text"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full mt-1 bg-brand-bg border border-brand-border rounded-md p-3 font-mono text-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button onClick={() => setStep(2)} disabled={aadhaar.replace(/\s/g, '').length !== 12} className="w-full mt-4 bg-brand-primary text-black font-semibold py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  Get OTP
              </button>
          </div>
        );
      case 2: // OTP
        return (
           <div className="mt-6 text-left">
              <p className="text-sm text-center text-brand-text-secondary mb-2">An OTP has been sent to your registered mobile number.</p>
              <label className="text-sm text-brand-text-secondary">Enter 6-digit OTP</label>
              <input 
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full mt-1 bg-brand-bg border border-brand-border rounded-md p-3 font-mono text-lg text-center tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button onClick={() => setStep(3)} disabled={otp.length !== 6} className="w-full mt-4 bg-brand-primary text-black font-semibold py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  Verify OTP
              </button>
          </div>
        );
      case 3: // PAN + Bank
        return (
            <div className="mt-6 text-left">
              <label className="text-sm text-brand-text-secondary">Enter your PAN Number</label>
               <input 
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full mt-1 bg-brand-bg border border-brand-border rounded-md p-3 font-mono text-lg text-center tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
               <p className="text-xs text-brand-text-secondary mt-2 text-center">PAN will be verified via DigiLocker.</p>
               <div className="mt-4 text-center">
                   <p className="text-sm text-brand-text-secondary">A ₹1 "penny drop" transaction will be made to your primary bank account to verify it.</p>
               </div>
              <button onClick={handleSubmit} disabled={pan.length !== 10 || isSubmitting} className="w-full mt-4 bg-brand-green text-black font-semibold py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2">
                  {isSubmitting ? <><Icons.spinner className="animate-spin"/> <span>Verifying...</span></> : <span>Complete Verification</span>}
              </button>
          </div>
        );
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-surface rounded-lg w-full max-w-md border border-brand-border shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-white text-2xl font-bold">&times;</button>
        <div className="p-8">
            <div className="text-center">
              <Icons.shieldCheck className="h-12 w-12 text-brand-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Full KYC Verification</h2>
              <p className="text-sm text-brand-text-secondary mt-1">Powered by India Digital Public Infrastructure (DPI)</p>
            </div>
            
            <div className="w-full flex justify-between items-center my-6 text-xs text-center">
                <div className={`flex-1 ${step >= 1 ? 'text-brand-primary' : 'text-brand-text-secondary'}`}>Aadhaar</div>
                <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-brand-primary' : 'border-brand-border'}`}></div>
                <div className={`flex-1 ${step >= 2 ? 'text-brand-primary' : 'text-brand-text-secondary'}`}>PAN</div>
                <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-brand-primary' : 'border-brand-border'}`}></div>
                <div className={`flex-1 ${step >= 3 ? 'text-brand-primary' : 'text-brand-text-secondary'}`}>Bank</div>
            </div>

            {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default KycModal;
