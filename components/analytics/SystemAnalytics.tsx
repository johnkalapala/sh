
import React, { useState } from 'react';
import Card from '../shared/Card';
import InteractiveArchitectureDiagram from './InteractiveArchitectureDiagram';
import LiveTransactionFeed from './LiveTransactionFeed';
import AnalyticsEngineLog from './AnalyticsEngineLog';
import { ScenarioType, Bond } from '../../types';
import { Icons } from '../Icons';
import DependencyChecklist from './DependencyChecklist';

// Import new test components
import DefaultTestView from './tests/DefaultTestView';
import VolatilityTest from './tests/VolatilityTest';
import ApiGatewayStressTest from './tests/ApiGatewayStressTest';
import DltCongestionTest from './tests/DltCongestionTest';
import DpiOutageTest from './tests/DpiOutageTest';
import QuantumLabView from './tests/QuantumLabView';
import RegulatoryDashboard from './RegulatoryDashboard';
import ScalabilityTestView from './tests/ScalabilityTestView';


interface SystemAnalyticsProps {
  backendState: any;
  bonds: Bond[];
}

type ActiveTest = 'normal' | 'volatility' | 'api' | 'dlt' | 'dpi' | 'quantum' | 'contingency' | 'scalability';

const SystemAnalytics: React.FC<SystemAnalyticsProps> = ({ backendState, bonds }) => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [activeTest, setActiveTest] = useState<ActiveTest>('normal');
  const { isContingencyMode, activeScenario } = backendState;

  const handleTestSelection = (test: ActiveTest, scenario: ScenarioType) => {
      setActiveTest(test);
      backendState.runScenario(scenario);
  };
  
  const TabButton = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => (
      <button onClick={() => setActiveTab(id)} className={`flex items-center justify-center space-x-2 px-4 py-2 font-semibold rounded-md transition-colors w-full ${activeTab === id ? 'bg-brand-primary text-black' : 'text-brand-text-secondary hover:bg-brand-surface'}`}>
          {icon}
          <span>{label}</span>
      </button>
  );

  const TestMenuItem: React.FC<{
      label: string;
      testId: ActiveTest;
      scenarioId: ScenarioType;
      icon: React.ReactNode;
  }> = ({ label, testId, scenarioId, icon }) => (
      <button
          onClick={() => handleTestSelection(testId, scenarioId)}
          className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors w-full ${
              activeTest === testId
                  ? 'bg-brand-primary/20 text-brand-primary'
                  : 'text-brand-text-secondary hover:bg-brand-surface hover:text-white'
          }`}
      >
          {icon}
          <span className="flex-1 text-left">{label}</span>
      </button>
  );
  
  const renderActiveTest = () => {
      switch(activeTest) {
          case 'normal': return <DefaultTestView />;
          case 'volatility': return <VolatilityTest backendState={backendState} />;
          case 'api': return <ApiGatewayStressTest backendState={backendState} />;
          case 'dlt': return <DltCongestionTest backendState={backendState} />;
          case 'dpi': return <DpiOutageTest backendState={backendState} />;
          case 'quantum': return <QuantumLabView />;
          case 'scalability': return <ScalabilityTestView backendState={backendState} />;
          case 'contingency': return <DependencyChecklist isContingencyMode={isContingencyMode} isTestView={true} />;
          default: return <DefaultTestView />;
      }
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-1 bg-brand-bg border border-brand-border rounded-lg">
            <TabButton id="monitoring" label="Live Monitoring" icon={<Icons.analytics />} />
            <TabButton id="testing" label="System & Quantum Lab" icon={<Icons.lab />} />
            <TabButton id="dependencies" label="Dependencies" icon={<Icons.link />} />
            <TabButton id="regulatory" label="Regulatory View" icon={<Icons.shieldNodes />} />
        </div>
        
        {activeTab === 'monitoring' && (
             <div className="space-y-6">
                <Card>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-2xl font-bold">Live System Architecture</h2>
                         <p className="text-brand-text-secondary">
                           This diagram represents the real-time health and data flow of the QuantumBond platform's architecture.
                         </p>
                      </div>
                       <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isContingencyMode ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-brand-primary/20 text-brand-primary'}`}>
                          Mode: {isContingencyMode ? 'Standard Operations' : activeScenario === 'SCALE_TEST' ? 'High-Throughput' : 'Bio-Quantum'}
                       </div>
                    </div>
                    <InteractiveArchitectureDiagram metrics={backendState.metrics} isContingencyMode={isContingencyMode} activeScenario={activeScenario} />
                </Card>
                <Card>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-center">Live Transaction Feed</h3>
                            <LiveTransactionFeed transactions={backendState.transactions} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-center">AI & Bio-Inspired Engine Log</h3>
                            <AnalyticsEngineLog logs={backendState.analyticsLogs} />
                        </div>
                    </div>
                </Card>
            </div>
        )}

        {activeTab === 'dependencies' && (
            <Card>
                <DependencyChecklist isContingencyMode={isContingencyMode} />
            </Card>
        )}

        {activeTab === 'regulatory' && (
            <RegulatoryDashboard backendState={backendState} bonds={bonds} />
        )}
        
        {activeTab === 'testing' && (
            <Card>
                <div className="flex space-x-6">
                    {/* Sub-menu Sidebar */}
                    <nav className="w-1/4 xl:w-1/5 space-y-2">
                         <TestMenuItem label="Normal Operations" testId="normal" scenarioId="NORMAL" icon={<Icons.status.ok />} />
                         <div className="pt-2">
                            <h4 className="px-3 pb-1 text-xs font-semibold text-brand-text-secondary uppercase">System Stress Tests</h4>
                             <TestMenuItem label="Market Volatility" testId="volatility" scenarioId="VOLATILITY_SPIKE" icon={<Icons.fire />} />
                             <TestMenuItem label="API Gateway Load" testId="api" scenarioId="API_GATEWAY_OVERLOAD" icon={<Icons.server />} />
                             <TestMenuItem label="DLT Congestion" testId="dlt" scenarioId="DLT_CONGESTION" icon={<Icons.clock />} />
                             <TestMenuItem label="DPI Service Outage" testId="dpi" scenarioId="DPI_OUTAGE" icon={<Icons.cloudSlash />} />
                         </div>
                         <div className="pt-2">
                            <h4 className="px-3 pb-1 text-xs font-semibold text-brand-text-secondary uppercase">Resilience Tests</h4>
                             <TestMenuItem label="Quantum Link Failure" testId="contingency" scenarioId="CONTINGENCY" icon={<Icons.zap className="text-brand-red"/>} />
                         </div>
                          <div className="pt-2">
                            <h4 className="px-3 pb-1 text-xs font-semibold text-brand-text-secondary uppercase">Advanced Simulations</h4>
                            <TestMenuItem label="Scalability Test" testId="scalability" scenarioId="SCALE_TEST" icon={<Icons.scaling />} />
                            <TestMenuItem label="Quantum Lab" testId="quantum" scenarioId="NORMAL" icon={<Icons.gemini />} />
                         </div>
                    </nav>
                    {/* Content Pane */}
                    <main className="w-3/4 xl:w-4/5 bg-brand-bg rounded-lg p-6">
                       {renderActiveTest()}
                    </main>
                </div>
            </Card>
        )}
    </div>
  );
};

export default SystemAnalytics;
