'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IdeaCard } from '@/lib/db';

interface ConceptClusterCardProps {
  cluster: {
    id: string;
    name: string;
    summary: string;
    status: string;
    createdAt: Date;
    ideas: IdeaCard[];
  };
}

export default function ConceptClusterCard({ cluster }: ConceptClusterCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);

  const handleStatusUpdate = async (newStatus: 'accepted' | 'rejected') => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/clusters/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId: cluster.id, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      router.refresh();
    } catch (err) {
      alert('Failed to update cluster status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateSpec = async () => {
    setIsGeneratingSpec(true);
    try {
      const response = await fetch('/api/clusters/generate-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId: cluster.id }),
      });

      if (!response.ok) throw new Error('Failed to generate spec');

      const data = await response.json();

      // Show spec kit in alert (in real app, would navigate to spec page or show modal)
      alert(`Spec Kit Generated!\n\nProblem: ${data.specKit.problem}\n\nTarget User: ${data.specKit.targetUser}\n\nSolution: ${data.specKit.solution}`);

      router.refresh();
    } catch (err) {
      alert('Failed to generate spec kit');
    } finally {
      setIsGeneratingSpec(false);
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }[cluster.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {cluster.name}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {cluster.status}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-gray-700 mb-4">{cluster.summary}</p>

      {/* Idea count and toggle */}
      <button
        onClick={() => setShowIdeas(!showIdeas)}
        className="text-sm text-blue-600 hover:text-blue-800 mb-3 flex items-center"
      >
        <svg
          className={`w-4 h-4 mr-1 transform transition-transform ${showIdeas ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {cluster.ideas.length} {cluster.ideas.length === 1 ? 'idea' : 'ideas'} in this cluster
      </button>

      {/* Ideas list */}
      {showIdeas && (
        <div className="mb-4 space-y-2 pl-4 border-l-2 border-blue-200">
          {cluster.ideas.map((idea) => (
            <div key={idea.id} className="text-sm">
              <p className="font-medium text-gray-900">{idea.title || 'Untitled'}</p>
              <p className="text-gray-600 text-xs">{idea.description.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t">
        {cluster.status === 'pending' && (
          <>
            <button
              onClick={() => handleStatusUpdate('accepted')}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Accept'}
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Reject'}
            </button>
          </>
        )}

        {cluster.status === 'accepted' && (
          <button
            onClick={handleGenerateSpec}
            disabled={isGeneratingSpec}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
          >
            {isGeneratingSpec ? 'Generating...' : 'Generate Spec Kit Draft'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 mt-4">
        Created {new Date(cluster.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
