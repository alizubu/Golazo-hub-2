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
      // Let's enable debug mode so we can visually check the coordinates
      formData.append('debug', 'true'); 

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

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Extract Match Stats</h2>
      
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
          <span className="ml-4 text-gray-600 dark:text-gray-300">Processing image via OCR... This may take a few seconds.</span>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {result && (
        <div className="space-y-8">
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

          {/* Debug Panel to Verify Crops */}
          {result.debugImages && result.debugImages.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-xl mb-4">Debug: OCR Crop Verification</h3>
              <p className="text-sm text-gray-500 mb-4">
                If the extracted numbers are wrong, check these images. The text must be perfectly inside the box and readable.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.debugImages.map((img) => (
                  <div key={img.name} className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <span className="text-xs text-gray-500 mb-2 truncate w-full text-center">{img.name}</span>
                    <img src={img.dataUrl} alt={img.name} className="border border-red-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
