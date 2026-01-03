// Clips API
// Store and retrieve generated clips

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';

interface ClipData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  fps: number;
  resolution: string;
  effects: string[];
  music: string;
  author: string;
  createdAt: string;
  views: number;
  downloads: number;
  isPublic: boolean;
}

// In-memory storage for demo (use database in production)
const clips: ClipData[] = [];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clipData: ClipData = {
      ...await request.json(),
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author: (session?.user as any)?.name || 'Anonymous',
      createdAt: new Date().toISOString(),
      views: 0,
      downloads: 0,
      isPublic: false
    };
    
    clips.push(clipData);
    
    return NextResponse.json({ 
      success: true, 
      clipId: clipData.id,
      url: clipData.videoUrl
    });
  } catch (error) {
    console.error('Clip save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const authorId = url.searchParams.get('author');
    const clipId = url.searchParams.get('id');
    
    if (clipId) {
      const clip = clips.find(c => c.id === clipId);
      if (!clip) {
        return NextResponse.json(
          { error: 'Clip not found' },
          { status: 404 }
        );
      }
      
      // Increment view count
      clip.views++;
      
      return NextResponse.json({ clip });
    }
    
    let filteredClips = clips;
    
    if (authorId) {
      filteredClips = clips.filter(c => c.author === authorId);
    }
    
    // Sort by most recent
    filteredClips.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ 
      clips: filteredClips,
      total: filteredClips.length
    });
  } catch (error) {
    console.error('Clip fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
