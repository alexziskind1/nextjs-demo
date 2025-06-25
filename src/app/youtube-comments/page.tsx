'use client';

import { useState } from 'react';
import { YouTubeApiService } from '@/lib/services/youtubeApiService';
import { YouTubeComment } from '@/lib/services/youtubeService';

export default function YouTubeCommentsPage() {
  const [url, setUrl] = useState('');
  const [maxResults, setMaxResults] = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [totalComments, setTotalComments] = useState(0);
  const [fetchProgress, setFetchProgress] = useState<{current: number, total: number} | null>(null);

  const handleFetchComments = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const validation = YouTubeApiService.validateUrlClient(url);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    setLoading(true);
    setError('');
    setComments([]);
    setVideoTitle('');
    setTotalComments(0);
    setFetchProgress(null);

    const result = await YouTubeApiService.fetchComments(url, maxResults);
    
    if (result.success) {
      setComments(result.comments || []);
      setVideoTitle(result.videoTitle || '');
      setTotalComments(result.totalComments || 0);
    } else {
      setError(result.error!);
    }
    
    setLoading(false);
    setFetchProgress(null);
  };

  const handleDownloadCSV = () => {
    if (comments.length > 0 && videoTitle) {
      YouTubeApiService.downloadCommentsAsCSV(comments, videoTitle);
    }
  };

  const getTotalCommentsAndReplies = () => {
    let total = comments.length;
    comments.forEach(comment => {
      if (comment.replies) {
        total += comment.replies.length;
      }
    });
    return total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            📹 YouTube Comments Fetcher
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Extract comments from any YouTube video and download as CSV
          </p>
          
          {/* Form */}
          <form onSubmit={handleFetchComments} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL:
                </label>
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Comments:
                </label>
                <select
                  id="maxResults"
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={loading}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={2500}>2,500</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out"
                >
                  {loading ? (
                    maxResults > 100 ? 
                      `Fetching ${maxResults.toLocaleString()} comments...` : 
                      'Fetching...'
                  ) : 'Fetch Comments'}
                </button>
              </div>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-center">
                {error}
              </p>
            </div>
          )}

          {/* Progress Display */}
          {loading && maxResults > 100 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-center mb-2">
                Fetching comments... This may take a moment for large requests.
              </p>
              <p className="text-blue-600 text-center text-sm">
                YouTube API limits us to 100 comments per request, so we need to make multiple requests for {maxResults.toLocaleString()} comments.
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {comments.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Video Info & Download */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {videoTitle}
                </h2>
                <p className="text-gray-600">
                  Found {getTotalCommentsAndReplies()} total comments and replies ({comments.length} top-level comments)
                </p>
              </div>
              
              <button
                onClick={handleDownloadCSV}
                className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition duration-200 ease-in-out flex items-center"
              >
                📊 Download CSV
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.map((comment, index) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                  {/* Main Comment */}
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800">{comment.author}</span>
                      <div className="text-sm text-gray-500 flex items-center space-x-4">
                        <span>👍 {comment.likeCount}</span>
                        <span>{new Date(comment.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {comment.text}
                    </p>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 pl-4 border-l-2 border-gray-200 space-y-3">
                      <p className="text-sm font-medium text-gray-600">
                        {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}:
                      </p>
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-700 text-sm">{reply.author}</span>
                            <div className="text-xs text-gray-500 flex items-center space-x-2">
                              <span>👍 {reply.likeCount}</span>
                              <span>{new Date(reply.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {reply.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-red-600 hover:text-red-800 text-sm underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
