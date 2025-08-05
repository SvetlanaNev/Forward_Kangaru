
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
    const slots = await FirebaseCollections.getAvailabilitySlots();
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching availability slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    const { title, startTime, endTime, description, meetingLink } = await request.json();

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Start time and end time are required' },
        { status: 400 }
      );
    }

    const slotData = {
      userId,
      title: title || 'Available',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isRecurring: false,
      maxBookings: 1,
      description: description || '',
      meetingLink: meetingLink || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const slotId = await FirebaseCollections.createAvailabilitySlot(slotData);

    return NextResponse.json({ ...slotData, id: slotId }, { status: 201 });
  } catch (error) {
    console.error('Error creating availability slot:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
