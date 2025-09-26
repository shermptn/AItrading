import { useAuth } from '../../auth/AuthContext';
import TradingViewTicker from './TradingViewTicker';

type Page = 'commandCenter' | 'marketPulse' | 'knowledgeHub';

interface Props {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavButton = ({ page, label, activePage, setActivePage }: { page: Page; label: string; activePage: Page; setActivePage: (page: Page) => void; }) => (
  <button onClick={() => setActivePage(page)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activePage === page ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}>
    {label}
  </button>
);

export default function Header({ activePage, setActivePage }: Props) {
  const { user, login, logout } = useAuth();
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <h1 className="text-xl font-bold text-white">AI Trader Insights</h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-2">
            <NavButton page="commandCenter" label="Command Center" activePage={activePage} setActivePage={setActivePage} />
            <NavButton page="marketPulse" label="Market Pulse" activePage={activePage} setActivePage={setActivePage} />
            <NavButton page="knowledgeHub" label="Knowledge Hub" activePage={activePage} setActivePage={setActivePage} />
          </nav>
          <div className="hidden md:block w-px h-6 bg-neutral-700"></div>
          {user ? (
            <>
              <span className="text-xs text-neutral-400 mr-2">{user.email}</span>
              <button onClick={logout} className="text-sm font-medium text-neutral-300 hover:text-white">Logout</button>
            </>
          ) : (
            <button onClick={login} className="text-sm font-medium text-neutral-300 hover:text-white">Login / Signup</button>
          )}
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Your Unified Trading Cockpit</h2>
        <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">We provide institutional-grade data, clean UI, and contextual AI insights—without the bloat or the cost.</p>

        {/* TradingView ticker placed directly under the header text on the homepage */}
        <div className="mt-4">
          <TradingViewTicker />
        </div>
      </div>
    </header>
  );
}
