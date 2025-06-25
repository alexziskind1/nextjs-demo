import { NextRequest, NextResponse } from 'next/server';
import { YouTubeService } from '@/lib/services/youtubeService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, maxResults = 100 } = body;

    // Validate the YouTube URL
    const validation = YouTubeService.validateYouTubeUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check for service account configuration
    const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountPath && !serviceAccountJson) {
      return NextResponse.json(
        { error: 'Google service account not configured. Please set GOOGLE_SERVICE_ACCOUNT_JSON environment variable.' },
        { status: 500 }
      );
    }

    // Fetch comments using service account
    const result = await YouTubeService.fetchComments(
      validation.videoId!,
      maxResults
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        comments: result.comments,
        videoTitle: result.videoTitle,
        totalComments: result.totalComments
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
