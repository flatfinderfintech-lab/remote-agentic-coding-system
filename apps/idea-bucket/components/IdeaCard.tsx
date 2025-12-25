import type { IdeaCard } from '@/lib/db';

interface IdeaCardProps {
  idea: IdeaCard;
}

export default function IdeaCardComponent({ idea }: IdeaCardProps) {
  const tags = idea.tags ? JSON.parse(idea.tags) : [];

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      {/* Processing indicator */}
      {!idea.processed && (
        <div className="mb-3 flex items-center text-sm text-yellow-600">
          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing with AI...
        </div>
      )}

      {/* Image */}
      {idea.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={idea.imageUrl}
            alt="Idea sketch"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {idea.title || 'Untitled Idea'}
      </h3>

      {/* Summary */}
      {idea.summary && (
        <p className="text-gray-600 text-sm mb-3">
          {idea.summary}
        </p>
      )}

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4">
        {idea.description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 border-t pt-3">
        {new Date(idea.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}
