import { NextRequest, NextResponse } from 'next/server';
import { aiAssistant } from '@/features/ai-assistant';

export async function POST(request: NextRequest) {
  try {
    const { message, userId, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await aiAssistant.sendMessage(message, userId, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  const history = aiAssistant.getHistory(userId);
  const suggestedQuestions = aiAssistant.getSuggestedQuestions();

  return NextResponse.json({ history, suggestedQuestions });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  aiAssistant.clearHistory(userId);

  return NextResponse.json({ success: true });
}
