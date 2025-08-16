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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step === 1 && aadhaar.replace(/\s/g, '').length === 12) {
      setStep(2);
    }
    if (step === 2 && otp.length === 6) {
      setIsSubmitting(true);
      setTimeout(() => {
        onKycSubmit();
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-surface rounded-lg w-full max-w-md border border-brand-border shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-white text-2xl font-bold">&times;</button>
        <div className="p-8 text-center">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar Logo" className="h-12 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Aadhaar e-KYC Verification</h2>
            <p className="text-sm text-brand-text-secondary mt-1">Powered by India Digital Public Infrastructure (DPI)</p>

            {step === 1 && (
                <div className="mt-6 text-left">
                    <label className="text-sm text-brand-text-secondary">Enter your 12-digit Aadhaar Number</label>
                    <input 
                        type="text"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value)}
                        placeholder="XXXX XXXX XXXX"
                        className="w-full mt-1 bg-brand-bg border border-brand-border rounded-md p-3 font-mono text-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <button onClick={handleNext} disabled={aadhaar.replace(/\s/g, '').length !== 12} className="w-full mt-4 bg-brand-primary text-black font-semibold py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        Get OTP
                    </button>
                </div>
            )}

            {step === 2 && (
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
                    <button onClick={handleNext} disabled={otp.length !== 6 || isSubmitting} className="w-full mt-4 bg-brand-green text-black font-semibold py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2">
                        {isSubmitting ? <><Icons.spinner className="animate-spin"/> <span>Verifying...</span></> : <span>Submit OTP</span>}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default KycModal;
