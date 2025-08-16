import React, { useState, useCallback, useEffect } from 'react';
import { ViewState, PortfolioHolding, Bond, User, ToastMessage } from './types';
import { INITIAL_USER_PORTFOLIO, BONDS, INITIAL_USER_BALANCE } from './constants';
import { useBackendSimulator } from './hooks/useBackendSimulator';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Portfolio from './components/Portfolio';
import BondDetail from './components/BondDetail';
import SystemAnalytics from './components/analytics/SystemAnalytics';
import LoginModal from './components/LoginModal';
import Header from './components/Header';
import Toast from './components/Toast';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>({ page: 'dashboard' });
  const [user, setUser] = useState<User>({ isConnected: false, walletAddress: '', balance: 0 });
  const [userPortfolio, setUserPortfolio] = useState<PortfolioHolding[]>(INITIAL_USER_PORTFOLIO);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const backendState = useBackendSimulator(BONDS);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const navigate = useCallback((view: ViewState) => {
    setCurrentView(view);
  }, []);

  const handleConnectWallet = () => {
    const randomAddress = `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setUser({
      isConnected: true,
      walletAddress: randomAddress,
      balance: INITIAL_USER_BALANCE,
    });
    addToast("Wallet connected successfully!");
  };
  
  const handleDisconnectWallet = () => {
    setUser({ isConnected: false, walletAddress: '', balance: 0 });
    addToast("Wallet disconnected.", "error");
  };

  const handleTrade = useCallback((bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => {
    const tradeValue = bond.currentPrice * quantity;

    if (tradeType === 'buy' && user.balance < tradeValue) {
      addToast("Insufficient funds to complete this transaction.", "error");
      return;
    }

    setUser(prevUser => ({...prevUser, balance: prevUser.balance + (tradeType === 'sell' ? tradeValue : -tradeValue) }));

    setUserPortfolio(prevPortfolio => {
      const newPortfolio = [...prevPortfolio];
      const holdingIndex = newPortfolio.findIndex(h => h.bondId === bond.id);

      if (holdingIndex > -1) {
        const existingHolding = newPortfolio[holdingIndex];
        if (tradeType === 'buy') {
          const newTotalQuantity = existingHolding.quantity + quantity;
          const newTotalValue = (existingHolding.purchasePrice * existingHolding.quantity) + tradeValue;
          existingHolding.purchasePrice = newTotalValue / newTotalQuantity;
          existingHolding.quantity = newTotalQuantity;
        } else {
          existingHolding.quantity -= quantity;
          if (existingHolding.quantity <= 0) {
            newPortfolio.splice(holdingIndex, 1);
          }
        }
      } else if (tradeType === 'buy') {
        newPortfolio.push({
          bondId: bond.id,
          quantity: quantity,
          purchasePrice: bond.currentPrice,
        });
      }
      return newPortfolio;
    });

    addToast(`${tradeType.toUpperCase()} order for ${quantity.toFixed(2)} units of ${bond.name.split(' ')[0]} executed!`);
  }, [user.balance]);

  const renderPage = () => {
    const pageProps = { navigate, user, handleTrade, userPortfolio, addToast, backendState };
    const bondsWithLiveData = BONDS.map(b => backendState.liveBondData[b.id] || b);

    switch (currentView.page) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'marketplace':
        return <Marketplace {...pageProps} bonds={bondsWithLiveData} />;
      case 'portfolio':
        return <Portfolio {...pageProps} />;
      case 'bondDetail':
        return currentView.bondId ? <BondDetail bondId={currentView.bondId} {...pageProps} /> : <Marketplace {...pageProps} bonds={bondsWithLiveData} />;
      case 'system-analytics':
        return <SystemAnalytics backendState={backendState} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

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
        />
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
