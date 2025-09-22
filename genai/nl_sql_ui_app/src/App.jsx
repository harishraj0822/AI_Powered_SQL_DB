import React, { useState, useEffect, useRef } from 'react';

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
        body: JSON.stringify({ prompt, connection })
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setResponseData(result);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [responseData]);

  const handleClear = () => {
    setPrompt('');
    setResponseData(null);
    setError('');
  };

  const handleConnectionChange = (e) => {
    setConnection({ ...connection, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#2d2d2d] p-6 rounded-xl shadow-xl text-center">
        <div className="flex items-center justify-center h-[60vh] w-full">
          <h1 className="text-3xl font-bold text-center">Talk To DB</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left mb-6">
          {['host', 'port', 'user', 'password', 'database'].map((field) => (
            <input
              key={field}
              name={field}
              value={connection[field]}
              onChange={handleConnectionChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="bg-[#3b3b3b] text-white p-2 rounded focus:outline-none placeholder-gray-400"
              type={field === 'password' ? 'password' : 'text'}
            />
          ))}
        </div>

        <div className="w-full bg-[#3b3b3b] rounded-xl p-4 mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-[180px] p-4 text-lg text-white bg-transparent focus:outline-none resize-none placeholder-gray-400 rounded"
            placeholder="Type your SQL-related prompt here..."
          ></textarea>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-400 text-white px-8 py-3 rounded hover:bg-green-300 text-lg font-medium"
          >
            {loading ? 'Generating...' : 'Run Query'}
          </button>
          <button
            onClick={handleClear}
            className="bg-red-600 text-white px-8 py-3 rounded hover:bg-red-700 text-lg font-medium"
          >
            Clear
          </button>
        </div>

        {error && <p className="text-red-400 mt-6 text-lg">❌ {error}</p>}

        {responseData && (
          <div ref={scrollRef} className="mt-8 text-left w-full">
            <p className="font-semibold text-lg mb-2">Generated SQL:</p>
            <div className="mb-4">
              <div className="relative bg-black text-green-400 p-4 pl-5 pr-5 rounded text-sm font-mono ring-2 ring-green-500 shadow-lg overflow-x-auto whitespace-pre-wrap break-words">
                {responseData.sql}
              </div>
              <div className="text-right mt-2">
                <button
                  onClick={() => navigator.clipboard.writeText(responseData.sql)}
                  className="bg-gray-700 text-white text-xs px-3 py-1 rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
            </div>

            <p className="font-semibold text-lg mb-2">Output:</p>
            <div className="overflow-x-auto mt-6 border rounded">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    {Object.keys(responseData.data[0] || {}).map((key) => (
                      <th key={key} className="px-4 py-2 text-sm font-medium text-gray-300 border-b text-center">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[#1e1e1e] divide-y divide-gray-700">
                  {responseData.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-4 py-2 text-sm text-gray-200 border-b text-center">
                          {value}
                        </td>
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