
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
    const role = searchParams.get('role');

    let users;
    if (role) {
      users = await FirebaseCollections.getUsersByRole(role as 'FOUNDER' | 'EXPERT' | 'TEAM_MEMBER');
    } else {
      users = await FirebaseCollections.getAllUsers();
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
