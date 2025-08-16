import React from 'react';
import { Page, ViewState } from '../types';
import { Icons } from './Icons';

interface SidebarProps {
  currentPage: Page;
  navigate: (view: ViewState) => void;
}

const NavItem: React.FC<{
  label: string;
  page: Page;
  currentPage: Page;
  navigate: (view: ViewState) => void;
  icon: React.ReactNode;
}> = ({ label, page, currentPage, navigate, icon }) => (
  <button
    onClick={() => navigate({ page })}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full ${
      currentPage === page
        ? 'bg-brand-primary text-black font-semibold'
        : 'text-brand-text-secondary hover:bg-brand-surface hover:text-white'
    }`}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigate }) => {
  return (
    <aside className="w-64 bg-brand-bg border-r border-brand-border flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center space-x-3 mb-8 px-2">
        <Icons.logo />
        <h1 className="text-xl font-bold text-white">QuantumBond</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavItem label="Dashboard" page="dashboard" currentPage={currentPage} navigate={navigate} icon={<Icons.dashboard />} />
        <NavItem label="Marketplace" page="marketplace" currentPage={currentPage} navigate={navigate} icon={<Icons.marketplace />} />
        <NavItem label="Portfolio" page="portfolio" currentPage={currentPage} navigate={navigate} icon={<Icons.portfolio />} />
        <div className="my-2 border-t border-brand-border"></div>
        <NavItem label="System Analytics" page="system-analytics" currentPage={currentPage} navigate={navigate} icon={<Icons.analytics />} />
        <NavItem label="Integrations & API" page="integrations" currentPage={currentPage} navigate={navigate} icon={<Icons.api />} />
        <NavItem label="Hardware Acceleration" page="hardware-acceleration" currentPage={currentPage} navigate={navigate} icon={<Icons.chip />} />
      </nav>
      <div className="mt-auto">
        <div className="text-xs text-brand-text-secondary p-2">
            <p>&copy; 2024 QuantumBond Exchange</p>
            <p>Built for the Securities Market Hackathon.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;