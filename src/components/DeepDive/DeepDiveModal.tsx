import { useState } from 'react';
import AISnapshotTab from './AISnapshotTab';
import FinancialsTab from './FinancialsTab';
import OwnershipTab from './OwnershipTab';
import OptionsFlowTab from './OptionsFlowTab';

interface Props {
  symbol: string;
  onClose: () => void;
}

type Tab = 'ai' | 'financials' | 'ownership' | 'options';

export default function DeepDiveModal({ symbol, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('ai');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai': return <AISnapshotTab symbol={symbol} />;
      case 'financials': return <FinancialsTab symbol={symbol} />;
      case 'ownership': return <OwnershipTab symbol={symbol} />;
      case 'options': return <OptionsFlowTab symbol={symbol} />;
      default: return null;
    }
  };
  
  const TabButton = ({ tabId, label }: { tabId: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        activeTab === tabId ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Deep Dive: <span className="text-amber-400">{symbol}</span></h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">&times;</button>
        </header>
        
        <nav className="p-4 flex gap-2 border-b border-neutral-800">
          <TabButton tabId="ai" label="AI Snapshot" />
          <TabButton tabId="financials" label="Financials" />
          <TabButton tabId="ownership" label="Ownership" />
          <TabButton tabId="options" label="Options Flow" />
        </nav>

        <main className="p-4 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
