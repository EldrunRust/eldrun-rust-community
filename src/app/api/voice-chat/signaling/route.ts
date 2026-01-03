// Voice Chat Signaling API
// WebRTC signaling for peer connections

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';

interface SignalingPayload {
  sdp?: string;
  type?: string;
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
  [key: string]: unknown;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  fromUserId: string;
  toUserId: string;
  payload: SignalingPayload;
}

// In-memory storage for demo (use Redis in production)
const signalingData: Map<string, SignalingMessage[]> = new Map();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message: SignalingMessage = {
      ...await request.json(),
      fromUserId: (session?.user as { id?: string })?.id || 'anonymous',
      timestamp: new Date().toISOString()
    };
    
    // Store message for recipient
    const recipientMessages = signalingData.get(message.toUserId) || [];
    recipientMessages.push(message);
    
    signalingData.set(message.toUserId, recipientMessages);
    
    // In production, use WebSocket or Server-Sent Events
    // For now, just store the message
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voice chat signaling error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session?.user as { id?: string })?.id || 'anonymous';
    const messages = signalingData.get(userId) || [];
    
    // Clear retrieved messages
    signalingData.set(userId, []);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Voice chat polling error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
