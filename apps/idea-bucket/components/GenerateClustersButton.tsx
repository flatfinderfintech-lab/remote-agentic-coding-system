'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GenerateClustersButton() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClusters = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/clusters/generate', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate clusters');
      }

      const data = await response.json();
      alert(`Generated ${data.count} new concept clusters!`);

      router.refresh();
    } catch (err) {
      alert('Failed to generate clusters. Make sure you have at least 2 processed ideas.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerateClusters}
      disabled={isGenerating}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        '🤖 Generate Clusters'
      )}
    </button>
  );
}
