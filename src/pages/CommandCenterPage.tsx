import CommandCenter from '../components/CommandCenter/CommandCenter';

export default function CommandCenterPage() {
  return (
    <main className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          AI Trader <span className="text-amber-400">Insights</span>
        </h1>
        <p className="text-neutral-400">Your unified trading cockpit. Current time in Calabasas, CA: {new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}</p>
      </header>
      <CommandCenter />
    </main>
  );
}
