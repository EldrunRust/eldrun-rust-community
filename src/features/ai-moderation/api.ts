// API Routes for AI Moderation
import { NextRequest, NextResponse } from 'next/server';
import { aiModeration } from './index';

export async function POST(request: NextRequest) {
  try {
    const { content, userId, context } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const result = await aiModeration.moderateContent(content, userId, context);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Moderation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const config = await request.json();
    aiModeration.updateConfig(config);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Config update error:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
