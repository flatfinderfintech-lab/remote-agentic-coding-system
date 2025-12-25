'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewIdeaForm() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please provide a description for your idea');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create idea');
      }

      // Redirect to ideas list
      router.push('/ideas');
      router.refresh();
    } catch (err) {
      setError('Failed to save idea. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Idea Description *
        </label>
        <textarea
          id="description"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your invention idea or inspiration..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Be as detailed or brief as you like. The AI will process it later.
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Image URL (Optional)
        </label>
        <input
          type="url"
          id="imageUrl"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/sketch.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={isSubmitting}
        />
        <p className="mt-1 text-sm text-gray-500">
          Add a link to an image, such as a photo of a napkin sketch.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/ideas')}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Idea'}
        </button>
      </div>

      {isSubmitting && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-blue-600">
              Saving your idea... AI will process it in the background.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
