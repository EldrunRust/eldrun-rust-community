// Analytics Events API
// Track user events and metrics

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';

interface AnalyticsEvent {
  type: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userId: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
}

// In-memory storage for demo (use database in production)
const events: AnalyticsEvent[] = [];
const metrics = {
  onlineUsers: 0,
  totalUsers: 2847,
  activeChats: 0,
  messagesPerMinute: 0,
  serverLoad: 0,
  memoryUsage: 0,
  networkLatency: 0,
  errorRate: 0
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const event: AnalyticsEvent = {
      ...await request.json(),
      userId: (session?.user as any)?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    events.push(event);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    // Update metrics based on events
    updateMetrics();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const type = url.searchParams.get('type');
    
    let filteredEvents = events;
    
    if (type) {
      filteredEvents = events.filter(e => e.type === type);
    }
    
    const recentEvents = filteredEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return NextResponse.json({
      events: recentEvents,
      metrics
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function updateMetrics() {
  // Simulate real-time metrics
  metrics.onlineUsers = Math.floor(Math.random() * 100) + 150;
  metrics.activeChats = Math.floor(Math.random() * 20) + 10;
  metrics.messagesPerMinute = Math.floor(Math.random() * 50) + 20;
  metrics.serverLoad = Math.random() * 30 + 20;
  metrics.memoryUsage = Math.random() * 20 + 40;
  metrics.networkLatency = Math.floor(Math.random() * 20) + 10;
  metrics.errorRate = Math.random() * 2;
}
