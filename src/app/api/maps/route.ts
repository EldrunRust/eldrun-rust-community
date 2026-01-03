// Maps API
// Store and retrieve user-created maps

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';

interface MapData {
  id: string;
  name: string;
  description: string;
  author: string;
  width: number;
  height: number;
  objects: any[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  downloads: number;
  rating: number;
}

// In-memory storage for demo (use database in production)
const maps: MapData[] = [];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mapData: MapData = {
      ...await request.json(),
      id: `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author: (session?.user as any)?.name || 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      downloads: 0,
      rating: 0
    };
    
    maps.push(mapData);
    
    return NextResponse.json({ 
      success: true, 
      mapId: mapData.id 
    });
  } catch (error) {
    console.error('Map save error:', error);
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
    const mapId = url.searchParams.get('id');
    
    if (mapId) {
      const map = maps.find(m => m.id === mapId);
      if (!map) {
        return NextResponse.json(
          { error: 'Map not found' },
          { status: 404 }
        );
      }
      
      // Increment download count
      map.downloads++;
      
      return NextResponse.json({ map });
    }
    
    let filteredMaps = maps;
    
    if (authorId) {
      filteredMaps = maps.filter(m => m.author === authorId);
    }
    
    // Sort by most recent
    filteredMaps.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ 
      maps: filteredMaps,
      total: filteredMaps.length
    });
  } catch (error) {
    console.error('Map fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
