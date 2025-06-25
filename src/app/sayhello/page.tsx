'use client';

import { useState } from 'react';
import { HelloApiService } from '@/lib/services/helloApiService';

export default function SayHelloPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const validation = HelloApiService.validateNameClient(name);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    // Call the API service
    const result = await HelloApiService.sayHello(name);
    
    if (result.success) {
      setMessage(result.message!);
    } else {
      setError(result.error!);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Say Hello! 👋
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name here..."
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out"
          >
            {loading ? 'Saying Hello...' : 'Say Hello!'}
          </button>
        </form>

        {/* Display results */}
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-center font-medium text-lg">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-center">
              {error}
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
