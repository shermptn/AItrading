import { useAuth } from '../../auth/AuthContext';

type Page = 'commandCenter' | 'marketPulse' | 'knowledgeHub';

interface Props {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavButton = ({ page, label, activePage, setActivePage }: { page: Page; label: string; activePage: Page; setActivePage: (page: Page) => void; }) => (
  <button
    onClick={() => setActivePage(page)}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      activePage === page ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'
    }`}
  >
    {label}
  </button>
);

export default function Header({ activePage, setActivePage }: Props) {
  const { user, login, logout } = useAuth();

  return (
    <header className="mb-6">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          {/* SVG Logo */}
          <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <h1 className="text-xl font-bold text-white">AI Trader Insights</h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-2">
            <NavButton page="commandCenter" label="Command Center" activePage={activePage} setActivePage={setActivePage} />
            <NavButton page="marketPulse" label="Market Pulse" activePage={activePage} setActivePage={setActivePage} />
            <NavButton page="knowledgeHub" label="Knowledge Hub" activePage={activePage} setActivePage={setActivePage} />
          </nav>
          <div className="w-px h-6 bg-neutral-700"></div> {/* Vertical separator */}
          {user ? (
            <button onClick={logout} className="text-sm font-medium text-neutral-300 hover:text-white">Logout</button>
          ) : (
            <button onClick={login} className="text-sm font-medium text-neutral-300 hover:text-white">Login / Signup</button>
          )}
        </div>
      </div>
      
      {/* Page Title & Mission Statement */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">
          {activePage === 'commandCenter' && 'Your Unified Trading Cockpit'}
          {activePage === 'marketPulse' && 'Market Pulse Dashboard'}
          {activePage === 'knowledgeHub' && 'Knowledge Hub'}
        </h2>
        <p className="text-neutral-400 mt-1 max-w-2xl mx-auto">
          We provide institutional-grade data, clean UI, and contextual AI insights—without the bloat or the cost.
        </p>
      </div>
    </header>
  );
}
