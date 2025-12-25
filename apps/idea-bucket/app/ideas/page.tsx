import Link from 'next/link';
import { getAllIdeaCards } from '@/lib/db';
import IdeaCardComponent from '@/components/IdeaCard';

export default async function IdeasPage() {
  const ideas = await getAllIdeaCards();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600 mt-2">
            {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} captured
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          + Add New Idea
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No ideas yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by capturing your first invention idea.
          </p>
          <div className="mt-6">
            <Link
              href="/ideas/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              + Add Your First Idea
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <IdeaCardComponent key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
