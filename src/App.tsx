import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // This function calls our test endpoint
    async function fetchTestMessage() {
      try {
        const response = await fetch('/api/test');
        const data = await response.json();
        setMessage(data.message || 'Error fetching message.');
      } catch (error) {
        setMessage('Failed to connect to the API.');
        console.error(error);
      }
    }

    fetchTestMessage();
  }, []);

  return (
    <div className="bg-neutral-900 text-white min-h-screen flex items-center justify-center">
      <div className="text-center p-8 rounded-lg bg-neutral-800 shadow-lg">
        <h1 className="text-3xl font-bold mb-4">AI Trader Insights v2.0</h1>
        <p className="text-lg text-green-400 font-mono">{message}</p>
      </div>
    </div>
  );
}

export default App;
