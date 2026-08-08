import MatchStatsUploader from '@/app/components/admin/MatchStatsUploader';

export default function TestOCRPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            OCR Extraction Test
          </h1>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-400">
            Upload a screenshot of the match stats to test the coordinate map.
          </p>
        </div>
        
        <MatchStatsUploader />
      </div>
    </div>
  );
}
