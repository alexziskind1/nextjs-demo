import { youtube_v3, google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

export interface YouTubeComment {
  id: string;
  author: string;
  text: string;
  publishedAt: string;
  likeCount: number;
  replies?: YouTubeComment[];
}

export interface YouTubeCommentsResult {
  success: boolean;
  comments?: YouTubeComment[];
  error?: string;
  videoTitle?: string;
  totalComments?: number;
}

export class YouTubeService {
  private static extractVideoId(url: string): string | null {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // If it's already just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

    return null;
  }

  static validateYouTubeUrl(url: string): { isValid: boolean; error?: string; videoId?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'YouTube URL is required' };
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl.length === 0) {
      return { isValid: false, error: 'YouTube URL cannot be empty' };
    }

    const videoId = this.extractVideoId(trimmedUrl);
    if (!videoId) {
      return { 
        isValid: false, 
        error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.' 
      };
    }

    return { isValid: true, videoId };
  }

  private static async createYouTubeClient(): Promise<youtube_v3.Youtube> {
    try {
      let auth: GoogleAuth;

      // Get service account from JSON environment variable
      const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      if (serviceAccountJson) {
        try {
          const credentials = JSON.parse(serviceAccountJson);
          auth = new GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/youtube.force-ssl']
          });
        } catch (parseError) {
          throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format. Please ensure it contains valid JSON.');
        }
      } 
      // Fallback method: Use service account file path
      else {
        const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
        if (!serviceAccountPath) {
          throw new Error('No service account configuration found. Please set GOOGLE_SERVICE_ACCOUNT_JSON environment variable with your service account JSON content.');
        }

        // Resolve the path relative to project root
        const fullPath = path.resolve(process.cwd(), serviceAccountPath);
        
        if (!fs.existsSync(fullPath)) {
          throw new Error(`Service account file not found at: ${fullPath}. Consider using GOOGLE_SERVICE_ACCOUNT_JSON environment variable instead.`);
        }

        auth = new GoogleAuth({
          keyFile: fullPath,
          scopes: ['https://www.googleapis.com/auth/youtube.force-ssl']
        });
      }

      // Create YouTube API client using the auth object directly (like your working example)
      return google.youtube({
        version: 'v3',
        auth
      });
    } catch (error: any) {
      console.error('Failed to create YouTube client:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  static async fetchComments(
    videoId: string, 
    maxResults: number = 100
  ): Promise<YouTubeCommentsResult> {
    try {
      const youtube = await this.createYouTubeClient();

      // First, get video details
      const videoResponse = await youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: [videoId]
      });

      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        return { success: false, error: 'Video not found or may be private' };
      }

      const video = videoResponse.data.items[0];
      const videoTitle = video.snippet?.title || 'Unknown Title';
      const commentCount = parseInt(video.statistics?.commentCount || '0');

      // Check if comments are disabled
      if (commentCount === 0) {
        return { 
          success: false, 
          error: 'Comments are disabled for this video or no comments exist' 
        };
      }

      // Fetch comments (using similar pattern to your working code)
      const commentsResponse = await youtube.commentThreads.list({
        part: ['snippet'],
        videoId: videoId,
        maxResults: Math.min(maxResults, 100), // YouTube API limit
        order: 'relevance'
      });

      if (!commentsResponse.data.items) {
        return { 
          success: true, 
          comments: [], 
          videoTitle,
          totalComments: 0 
        };
      }

      const comments: YouTubeComment[] = commentsResponse.data.items.map(item => {
        const snippet = item.snippet?.topLevelComment?.snippet;
        const comment: YouTubeComment = {
          id: item.id || '',
          author: snippet?.authorDisplayName || 'Unknown',
          text: snippet?.textDisplay || '',
          publishedAt: snippet?.publishedAt || '',
          likeCount: snippet?.likeCount || 0
        };

        // Note: Replies are not fetched in this simple implementation
        // to match your working code pattern
        
        return comment;
      });

      return { 
        success: true, 
        comments, 
        videoTitle,
        totalComments: comments.length 
      };

    } catch (error: any) {
      console.error('YouTube API Error:', error);
      
      if (error.code === 403) {
        return { success: false, error: 'API quota exceeded or invalid API key' };
      } else if (error.code === 404) {
        return { success: false, error: 'Video not found' };
      } else {
        return { success: false, error: 'Failed to fetch comments from YouTube' };
      }
    }
  }

  static formatCommentsForCSV(comments: YouTubeComment[]): any[] {
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

    return csvData;
  }
}
