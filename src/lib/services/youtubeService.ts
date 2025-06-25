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

      // Try base64 encoded service account first (more reliable for some platforms)
      const serviceAccountBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
      if (serviceAccountBase64) {
        try {
          console.log('Using base64 encoded service account');
          const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
          const credentials = JSON.parse(serviceAccountJson);
          
          // Validate required fields
          const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
          const missingFields = requiredFields.filter(field => !credentials[field]);
          
          if (missingFields.length > 0) {
            throw new Error(`Service account JSON is missing required fields: ${missingFields.join(', ')}`);
          }
          
          console.log('Service account project:', credentials.project_id);
          console.log('Service account email:', credentials.client_email);
          
          auth = new GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/youtube.force-ssl']
          });
        } catch (error) {
          console.error('Base64 service account error:', error);
          throw new Error(`Invalid GOOGLE_SERVICE_ACCOUNT_BASE64 format: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      // Get service account from JSON environment variable
      else {
        const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
          try {
            // Add debugging for production
            console.log('Using JSON service account');
            console.log('Service account JSON length:', serviceAccountJson.length);
            console.log('Service account JSON starts with:', serviceAccountJson.substring(0, 50));
            console.log('Service account JSON ends with:', serviceAccountJson.substring(serviceAccountJson.length - 50));
            
            // Clean the JSON string - handle common production issues
            let cleanedJson = serviceAccountJson.trim();
            
            // If the JSON is wrapped in quotes (common in some deployments), remove them
            if (cleanedJson.startsWith('"') && cleanedJson.endsWith('"')) {
              cleanedJson = cleanedJson.slice(1, -1);
              console.log('Removed outer quotes from JSON');
            }
            
            // Fix escaped quotes and newlines that might be double-escaped
            cleanedJson = cleanedJson.replace(/\\"/g, '"').replace(/\\n/g, '\n');
            
            console.log('Cleaned JSON length:', cleanedJson.length);
            console.log('Cleaned JSON starts with:', cleanedJson.substring(0, 50));
            
            const credentials = JSON.parse(cleanedJson);
            
            // Validate required fields
            const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
            const missingFields = requiredFields.filter(field => !credentials[field]);
            
            if (missingFields.length > 0) {
              console.error('Missing required fields:', missingFields);
              console.error('Available fields:', Object.keys(credentials));
              throw new Error(`Service account JSON is missing required fields: ${missingFields.join(', ')}`);
            }
            
            // Check private key format
            if (!credentials.private_key.includes('BEGIN PRIVATE KEY')) {
              console.error('Private key format issue - missing BEGIN PRIVATE KEY header');
              console.error('Private key starts with:', credentials.private_key.substring(0, 50));
            }
            
            console.log('Service account project:', credentials.project_id);
            console.log('Service account email:', credentials.client_email);
            console.log('Private key length:', credentials.private_key.length);
            
            auth = new GoogleAuth({
              credentials,
              scopes: ['https://www.googleapis.com/auth/youtube.force-ssl']
            });
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Error details:', {
              name: parseError instanceof Error ? parseError.name : 'Unknown',
              message: parseError instanceof Error ? parseError.message : 'Unknown error',
              stack: parseError instanceof Error ? parseError.stack : 'No stack trace'
            });
            console.error('Raw JSON (first 200 chars):', serviceAccountJson.substring(0, 200));
            console.error('Raw JSON (last 200 chars):', serviceAccountJson.substring(Math.max(0, serviceAccountJson.length - 200)));
            throw new Error(`Invalid GOOGLE_SERVICE_ACCOUNT_JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          }
        }
        // Fallback method: Use service account file path
        else {
          const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
          if (!serviceAccountPath) {
            throw new Error('No service account configuration found. Please set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_BASE64 environment variable with your service account content.');
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
      }

      console.log('Creating YouTube client...');
      
      // Create YouTube API client using the auth object directly (like your working example)
      const youtube = google.youtube({
        version: 'v3',
        auth
      });
      
      console.log('YouTube client created successfully');
      return youtube;
    } catch (error: any) {
      console.error('Failed to create YouTube client:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  static async fetchComments(
    videoId: string, 
    maxResults: number = 500
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

      // Fetch comments with pagination
      const allComments: YouTubeComment[] = [];
      let nextPageToken: string | undefined = undefined;
      let totalFetched = 0;
      const batchSize = 100; // YouTube API maximum per request

      console.log(`Starting to fetch ${maxResults} comments for video: ${videoTitle}`);

      while (totalFetched < maxResults) {
        const remainingToFetch = Math.min(batchSize, maxResults - totalFetched);
        
        const commentsResponse: any = await youtube.commentThreads.list({
          part: ['snippet', 'replies'],
          videoId: videoId,
          maxResults: remainingToFetch,
          order: 'relevance',
          pageToken: nextPageToken
        });

        if (!commentsResponse.data.items || commentsResponse.data.items.length === 0) {
          break; // No more comments available
        }

        // Process this batch of comments
        const batchComments: YouTubeComment[] = commentsResponse.data.items.map((item: any) => {
          const snippet = item.snippet?.topLevelComment?.snippet;
          const comment: YouTubeComment = {
            id: item.id || '',
            author: snippet?.authorDisplayName || 'Unknown',
            text: snippet?.textDisplay || '',
            publishedAt: snippet?.publishedAt || '',
            likeCount: snippet?.likeCount || 0
          };

          // Add replies if they exist
          if (item.replies?.comments) {
            comment.replies = item.replies.comments.map((replyItem: any) => ({
              id: replyItem.id || '',
              author: replyItem.snippet?.authorDisplayName || 'Unknown',
              text: replyItem.snippet?.textDisplay || '',
              publishedAt: replyItem.snippet?.publishedAt || '',
              likeCount: replyItem.snippet?.likeCount || 0
            }));
          }
          
          return comment;
        });

        allComments.push(...batchComments);
        totalFetched += batchComments.length;

        console.log(`Fetched ${totalFetched}/${maxResults} comments (batch: ${batchComments.length})`);

        // Check if there are more pages
        nextPageToken = commentsResponse.data.nextPageToken;
        if (!nextPageToken) {
          break; // No more pages available
        }

        // Add a small delay between requests to be respectful to the API
        // Use longer delay for larger requests to avoid rate limiting
        const delay = maxResults > 1000 ? 200 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      console.log(`Completed fetching ${allComments.length} comments for video: ${videoTitle}`);

      return { 
        success: true, 
        comments: allComments, 
        videoTitle,
        totalComments: allComments.length 
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
