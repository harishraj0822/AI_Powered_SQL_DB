import React, { useState, useEffect, useRef } from 'react';
import './App.css'

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState({ host: '', port: '', user: '', password: '', database: '' });
  const scrollRef = useRef(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt before submitting.');
      return;
    }
    setLoading(true);
    setError('');
    setResponseData(null);

    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, connection }),
      });
      const result = await res.json();
      if (result.error) setError(result.error);
      else setResponseData(result);
    } catch {
      setError('Failed to connect to server');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [responseData]);

  const handleClear = () => {
    setPrompt('');
    setResponseData(null);
    setError('');
  };

  const handleConnectionChange = (e) => {
    setConnection({ ...connection, [e.target.name]: e.target.value });
  };

  const downloadCSV = () => {
    if (!responseData?.data) return;
    const keys = Object.keys(responseData.data[0]);
    const csvRows = [keys.join(','), ...responseData.data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white/90 p-6 rounded-2xl shadow-2xl text-gray-900">
        {/* Animated Gradient Title */}
        <div className="flex items-center justify-center h-[60vh] w-full">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient bg-[length:200%_200%]">
            AI Powered SQL
          </h1>
        </div>

        {/* Connection Inputs */}
        <div className="grid grid-cols-2 gap-4 text-left mb-6">
          {['host', 'port', 'user', 'password', 'database'].map(field => (
            <input
              key={field}
              name={field}
              value={connection[field]}
              onChange={handleConnectionChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="bg-gradient-to-r from-blue-300 to-green-300 text-gray-900 p-2 rounded focus:outline-none placeholder-gray-700"
              type={field === 'password' ? 'password' : 'text'}
            />
          ))}
        </div>

        {/* Prompt Textarea */}
        <div className="w-full rounded-xl p-4 mb-6">
          <textarea
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            className="w-full h-[180px] p-4 text-lg text-gray-900 bg-gradient-to-r from-yellow-200 to-orange-300 focus:outline-none resize-none placeholder-gray-700 rounded"
            placeholder="Type your SQL-related prompt here..."
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-emerald-500 hover:to-green-400 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-500 hover:scale-105"
          >
            {loading ? 'Generating…' : 'Run Query'}
          </button>
          <button
            onClick={handleClear}
            className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-pink-500 hover:to-red-400 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-500 hover:scale-105"
          >
            Clear
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-red-600 mt-6 text-lg">❌ {error}</p>}

        {/* Response */}
        {responseData && (
          <div ref={scrollRef} className="mt-8 text-left w-full">
            <p className="font-semibold text-lg mb-2 text-purple-700">Generated SQL:</p>
            <div className="mb-4">
              <div className="relative bg-black text-green-400 p-4 pl-5 pr-5 rounded text-sm font-mono ring-2 ring-green-500 shadow-lg overflow-x-auto whitespace-pre-wrap break-words">
                {responseData.sql}
              </div>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => navigator.clipboard.writeText(responseData.sql)}
                  className="bg-gray-700 text-white text-xs px-3 py-1 rounded hover:bg-gray-600"
                >
                  Copy
                </button>
                <button
                  onClick={downloadCSV}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-500"
                >
                  Download CSV
                </button>
              </div>
            </div>

            <p className="font-semibold text-lg mb-2 text-purple-700">Output:</p>
            <div className="overflow-x-auto mt-6 border rounded">
              <table className="min-w-full divide-y divide-purple-300">
                <thead className="bg-gradient-to-r from-indigo-400 to-blue-400 text-white">
                  <tr>
                    {Object.keys(responseData.data[0] || {}).map(key => (
                      <th key={key} className="px-4 py-2 text-sm font-medium border-b text-center">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
                  {responseData.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="opacity-0 animate-fadeSlide hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200"
                      style={{ animationDelay: `${rowIndex * 100}ms` }}
                    >
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-4 py-2 text-sm border-b text-center">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
