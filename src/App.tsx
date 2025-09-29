import { useState } from 'react';
import CommandCenterPage from './pages/CommandCenterPage';
import MarketPulsePage from "./MarketPulsePage";
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import Header from './components/common/Header';

type Page = 'commandCenter' | 'marketPulse' | 'knowledgeHub';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('commandCenter');

  return (
    <div className="bg-neutral-950 text-neutral-200 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-6">
        <Header activePage={activePage} setActivePage={setActivePage} />
        <main>
          {activePage === 'commandCenter' && <CommandCenterPage />}
          {activePage === 'marketPulse' && <MarketPulsePage />}
          {activePage === 'knowledgeHub' && <KnowledgeHubPage />}
        </main>
      </div>
    </div>
  );
}
