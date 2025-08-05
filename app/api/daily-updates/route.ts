
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

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const dailyUpdates = await FirebaseCollections.getDailyUpdatesByProject(projectId);
    return NextResponse.json(dailyUpdates);
  } catch (error) {
    console.error('Error fetching daily updates:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    const { projectId, day, wantToDoToday, whatDid, challenges, nextSteps } = await request.json();

    if (!projectId || !day) {
      return NextResponse.json(
        { error: 'Project ID and day are required' },
        { status: 400 }
      );
    }

    const updateData = {
      projectId,
      userId,
      day: parseInt(day),
      date: new Date(),
      wantToDoToday: wantToDoToday || '',
      whatDid: whatDid || '',
      challenges: challenges || '',
      nextSteps: nextSteps || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateId = await FirebaseCollections.createDailyUpdate(updateData);

    return NextResponse.json({ ...updateData, id: updateId }, { status: 201 });
  } catch (error) {
    console.error('Error creating daily update:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
