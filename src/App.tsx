import { useState } from 'react';
import CommandCenterPage from './pages/CommandCenterPage';
import MarketPulsePage from './pages-old/MarketPulsePage'; // Corrected path if needed
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import { useAuth } from './auth/AuthContext';

type Page = 'commandCenter' | 'marketPulse' | 'knowledgeHub';

function App() {
  const [activePage, setActivePage] = useState<Page>('commandCenter');
  const { user, login, logout } = useAuth();

  const NavButton = ({ page, label }: { page: Page; label: string }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activePage === page ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-neutral-950 text-neutral-200 min-h-screen font-sans">
      <div className="container mx-auto p-4">
        <header className="mb-6 flex justify-between items-center">
          <nav className="flex gap-2">
            <NavButton page="commandCenter" label="Command Center" />
            <NavButton page="marketPulse" label="Market Pulse" />
            <NavButton page="knowledgeHub" label="Knowledge Hub" />
          </nav>
          <div>
            {user ? (
              <button onClick={logout} className="text-sm">Logout</button>
            ) : (
              <button onClick={login} className="text-sm">Login / Signup</button>
            )}
          </div>
        </header>

        {activePage === 'commandCenter' && <CommandCenterPage />}
        {activePage === 'marketPulse' && <MarketPulsePage />}
        {activePage === 'knowledgeHub' && <KnowledgeHubPage />}
      </div>
    </div>
  );
}

export default App; // <-- Ensure "default" is here
