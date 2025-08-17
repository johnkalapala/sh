import React, { useState, useCallback, useMemo } from 'react';
import { ViewState, ToastMessage } from './types';
import { useAdvancedBackend } from './hooks/useAdvancedBackend';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Portfolio from './components/Portfolio';
import BondDetail from './components/BondDetail';
import SystemAnalytics from './components/analytics/SystemAnalytics';
import Integrations from './components/Integrations';
import HardwareAcceleration from './components/HardwareAcceleration';
import LoginModal from './components/LoginModal';
import Header from './components/Header';
import Toast from './components/Toast';
import KycBanner from './components/KycBanner';
import KycModal from './components/KycModal';
import UpiBanner from './components/UpiBanner';
import UpiMandateModal from './components/UpiMandateModal';
import ContingencyBanner from './components/ContingencyBanner';
import AddFundsModal from './components/AddFundsModal';
import Spinner from './components/shared/Spinner';
import ProfileSettings from './components/ProfileSettings';
import CircuitBreakerBanner from './components/CircuitBreakerBanner';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>({ page: 'dashboard' });
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);

  const {
    backendState,
    isLoading,
    addToast,
    toasts,
    handleConnectWallet,
    handleDisconnectWallet,
    handleTrade,
    handleSubmitKyc,
    handleStartUpiMandate,
    handleAddFunds,
  } = useAdvancedBackend();
  
  const { user, userPortfolio, isContingencyMode, isCircuitBreakerTripped } = backendState;

  const navigate = useCallback((view: ViewState) => {
    setCurrentView(view);
  }, []);

  const handleOpenKycModal = () => setIsKycModalOpen(true);
  const handleCloseKycModal = () => setIsKycModalOpen(false);
  const handleOpenUpiModal = () => setIsUpiModalOpen(true);
  const handleCloseUpiModal = () => setIsUpiModalOpen(false);
  const handleOpenAddFundsModal = () => setIsAddFundsModalOpen(true);
  const handleCloseAddFundsModal = () => setIsAddFundsModalOpen(false);
  
  const onKycSubmit = () => {
    handleSubmitKyc();
    handleCloseKycModal();
  };
  
  const onUpiSubmit = () => {
    handleStartUpiMandate();
    handleCloseUpiModal();
  };

  const onAddFundsSubmit = (amount: number) => {
    handleAddFunds(amount);
    handleCloseAddFundsModal();
  }

  const showUpiBanner = user.kyc.status === 'verified' && user.upiAutopay.status !== 'active' && user.walletBalance < user.upiAutopay.threshold;

  const renderPage = () => {
    const pageProps = { navigate, user, handleTrade, userPortfolio, addToast, backendState, onOpenAddFunds: handleOpenAddFundsModal };

    switch (currentView.page) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'marketplace':
        return <Marketplace {...pageProps} />;
      case 'portfolio':
        return <Portfolio {...pageProps} />;
      case 'bondDetail':
        return currentView.bondId ? <BondDetail bondId={currentView.bondId} {...pageProps} /> : <Marketplace {...pageProps} />;
      case 'system-analytics':
        return <SystemAnalytics backendState={backendState} />;
      case 'integrations':
        return <Integrations />;
      case 'hardware-acceleration':
        return <HardwareAcceleration />;
      case 'profile-settings':
        return <ProfileSettings user={user} onOpenUpiModal={handleOpenUpiModal} onOpenAddFundsModal={handleOpenAddFundsModal} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center p-4">
        <Spinner />
        <p className="mt-4 text-lg font-semibold text-brand-primary animate-pulse">Initializing AI-Native Market...</p>
        <p className="text-brand-text-secondary">Generating live bond data from Gemini. This may take a moment.</p>
      </div>
    );
  }

  if (!user.isConnected) {
    return <LoginModal onConnect={handleConnectWallet} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex">
      <Toast toasts={toasts} />
      <Sidebar currentPage={currentView.page} navigate={navigate} />
      <div className="flex-1 flex flex-col">
        <Header 
          currentPage={currentView.page} 
          user={user}
          onDisconnect={handleDisconnectWallet}
          activeScenario={backendState.activeScenario}
          isContingencyMode={isContingencyMode}
          isCircuitBreakerTripped={isCircuitBreakerTripped}
        />
        {isContingencyMode && <ContingencyBanner />}
        {isCircuitBreakerTripped && <CircuitBreakerBanner />}
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
          {user.kyc.status !== 'verified' && (
              <KycBanner status={user.kyc.status} onStartKyc={handleOpenKycModal} />
          )}
          {showUpiBanner && (
              <UpiBanner status={user.upiAutopay.status} onStartUpi={handleOpenUpiModal} />
          )}

          {renderPage()}

          {isKycModalOpen && <KycModal onClose={handleCloseKycModal} onKycSubmit={onKycSubmit} />}
          {isUpiModalOpen && <UpiMandateModal onClose={handleCloseUpiModal} onUpiSubmit={onUpiSubmit} />}
          {isAddFundsModalOpen && <AddFundsModal onClose={handleCloseAddFundsModal} onAddFunds={onAddFundsSubmit} />}
        </main>
      </div>
    </div>
  );
};

export default App;
