'use client';

import React, { useState } from 'react';
import { extractMatchStats } from '../actions/extractStats';

export default function MatchStatsUploader() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview URL for the selected image
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await extractMatchStats(formData);

      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFlipStats = () => {
    if (!result) return;
    setResult({
      ...result,
      home: result.away,
      away: result.home
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-6">Extract Match Stats</h2>
      
      <div className="mb-8">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300" htmlFor="file_input">Upload Screenshot</label>
        <input 
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
          id="file_input" 
          type="file" 
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-300">Processing image with AI... This may take a few seconds.</span>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={handleFlipStats}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
              Swap Home & Away
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-blue-600">Home Stats</h3>
              <ul className="space-y-2">
                {Object.entries(result.home).map(([key, value]) => (
                  <li key={key} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="capitalize text-gray-600 dark:text-gray-400">{key.replace(/_/g, ' ')}</span>
                    <span className="font-bold">{value || '-'}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-red-600">Away Stats</h3>
              <ul className="space-y-2">
                {Object.entries(result.away).map(([key, value]) => (
                  <li key={key} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="capitalize text-gray-600 dark:text-gray-400">{key.replace(/_/g, ' ')}</span>
                    <span className="font-bold">{value || '-'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
