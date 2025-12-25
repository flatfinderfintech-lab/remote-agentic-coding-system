import NewIdeaForm from '@/components/NewIdeaForm';

export default function NewIdeaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Capture New Idea</h1>
        <p className="text-gray-600 mt-2">
          Describe your invention idea or inspiration. You can optionally add an image,
          like a photo of a napkin sketch.
        </p>
      </div>

      <NewIdeaForm />
    </div>
  );
}
