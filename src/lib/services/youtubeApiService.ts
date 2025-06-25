import { YouTubeComment } from './youtubeService';

export interface FetchCommentsResponse {
  success: boolean;
  comments?: YouTubeComment[];
  videoTitle?: string;
  totalComments?: number;
  error?: string;
}

export class YouTubeApiService {
  private static readonly API_BASE = '/api';

  static async fetchComments(
    url: string, 
    maxResults: number = 500
  ): Promise<FetchCommentsResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/youtube-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, maxResults }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          comments: data.comments,
          videoTitle: data.videoTitle,
          totalComments: data.totalComments
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch comments'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to the server'
      };
    }
  }

  // Client-side URL validation for immediate feedback
  static validateUrlClient(url: string): { isValid: boolean; error?: string } {
    if (!url.trim()) {
      return { isValid: false, error: 'Please enter a YouTube URL' };
    }

    const trimmedUrl = url.trim();
    
    // Basic YouTube URL pattern check
    const isYouTubeUrl = /(?:youtube\.com|youtu\.be)/.test(trimmedUrl) || 
                        /^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl);
    
    if (!isYouTubeUrl) {
      return { 
        isValid: false, 
        error: 'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)' 
      };
    }

    return { isValid: true };
  }

  // Generate CSV download
  static downloadCommentsAsCSV(comments: YouTubeComment[], videoTitle: string) {
    const Papa = require('papaparse');
    
    // Flatten comments and replies for CSV
    const csvData: any[] = [];
    
    comments.forEach(comment => {
      // Add main comment
      csvData.push({
        Type: 'Comment',
        Author: comment.author,
        Text: comment.text.replace(/\n/g, ' ').replace(/\r/g, ''),
        'Published At': new Date(comment.publishedAt).toLocaleString(),
        'Like Count': comment.likeCount,
        'Reply To': ''
      });

      // Add replies
      if (comment.replies) {
        comment.replies.forEach(reply => {
          csvData.push({
            Type: 'Reply',
            Author: reply.author,
            Text: reply.text.replace(/\n/g, ' ').replace(/\r/g, ''),
            'Published At': new Date(reply.publishedAt).toLocaleString(),
            'Like Count': reply.likeCount,
            'Reply To': comment.author
          });
        });
      }
    });

    // Convert to CSV
    const csv = Papa.unparse(csvData);
    
    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_comments.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
