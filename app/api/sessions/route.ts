
import { NextRequest, NextResponse } from 'next/server';
import { FirebaseCollections } from '@/lib/firebase-collections';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

async function verifyAuth(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.substring(7);
  const decodedToken = await adminAuth.verifyIdToken(token);
  return decodedToken.uid;
}

export async function GET() {
  try {
    const sessions = await FirebaseCollections.getBookedSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    const { availabilitySlotId, title, description, projectId } = await request.json();

    if (!availabilitySlotId) {
      return NextResponse.json(
        { error: 'Availability slot ID is required' },
        { status: 400 }
      );
    }

    // For now, create a simple session without complex slot checking
    const sessionData = {
      availabilitySlotId,
      bookedByUserId: userId,
      projectId: projectId || '',
      title: title || 'Meeting',
      description: description || '',
      startTime: new Date(), // Should get from availability slot
      endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes later
      meetingLink: `https://meet.forward.app/room/${Math.random().toString(36).substring(7)}`,
      status: 'SCHEDULED' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sessionId = await FirebaseCollections.createBookedSession(sessionData);

    return NextResponse.json({ ...sessionData, id: sessionId });
  } catch (error) {
    console.error('Error creating booked session:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
