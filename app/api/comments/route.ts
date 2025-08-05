
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

    const comments = await FirebaseCollections.getCommentsByProject(projectId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    const { content, projectId } = await request.json();

    if (!content?.trim() || !projectId) {
      return NextResponse.json(
        { error: 'Content and project ID are required' },
        { status: 400 }
      );
    }

    const commentData = {
      content: content.trim(),
      projectId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const commentId = await FirebaseCollections.createComment(commentData);

    return NextResponse.json({ ...commentData, id: commentId }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
