import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface UpiModalProps {
  onClose: () => void;
  onUpiSubmit: () => void;
}

const UpiMandateModal: React.FC<UpiModalProps> = ({ onClose, onUpiSubmit }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: number;
    if (step === 2 && countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (step === 2 && countdown === 0) {
      setIsSubmitting(true);
      setTimeout(() => {
        onUpiSubmit();
        onClose();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [step, countdown, onUpiSubmit, onClose]);

  const handleAuthorize = () => {
    setStep(2); // Move to the "redirect" step
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-surface rounded-lg w-full max-w-md border border-brand-border shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-white text-2xl font-bold">&times;</button>
        <div className="p-8 text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
                <Icons.npci className="h-10" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/de/Unified_Payments_Interface_logo.svg" alt="UPI Logo" className="h-10" />
            </div>
            <h2 className="text-xl font-bold text-white">Enable UPI Auto Top-up</h2>
            <p className="text-sm text-brand-text-secondary mt-1">For automatically funding your QuantumBond wallet.</p>

            {step === 1 && (
                <div className="mt-6 text-left bg-brand-bg p-4 rounded-lg border border-brand-border">
                    <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                        <span className="text-brand-text-secondary">Merchant</span>
                        <span className="font-semibold text-white">QuantumBond Exchange</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 pb-3 border-b border-brand-border">
                        <span className="text-brand-text-secondary">Max Amount</span>
                        <span className="font-semibold text-white">₹2,00,000.00</span>
                    </div>
                     <div className="flex items-center justify-between pt-3">
                        <span className="text-brand-text-secondary">Frequency</span>
                        <span className="font-semibold text-white">As Presented</span>
                    </div>
                    <p className="text-xs text-brand-text-secondary mt-4">You are authorizing QuantumBond Exchange to automatically debit your account to top-up your wallet when its balance falls below a threshold. You will not need a PIN for these automated transactions.</p>
                    <button onClick={handleAuthorize} className="w-full mt-4 bg-brand-primary text-black font-semibold py-2 rounded-md hover:opacity-90 transition-opacity">
                        Authorize via UPI App
                    </button>
                </div>
            )}

            {step === 2 && (
                 <div className="mt-6 text-left p-4">
                    <div className="flex flex-col items-center justify-center">
                        <Icons.spinner className="animate-spin h-12 w-12 text-brand-primary mb-4" />
                        <h3 className="font-semibold text-lg text-white">Redirecting to your UPI App...</h3>
                        <p className="text-brand-text-secondary">Simulating authorization process.</p>
                        {!isSubmitting ? (
                             <p className="text-sm text-brand-text-secondary mt-2">Auto-confirming in {countdown}...</p>
                        ) : (
                             <p className="text-sm text-brand-green mt-2">Authorization successful. Returning...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UpiMandateModal;