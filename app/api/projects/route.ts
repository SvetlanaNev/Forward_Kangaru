
import { NextRequest, NextResponse } from 'next/server';
import { FirebaseCollections } from '@/lib/firebase-collections';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

async function verifyAuth(request: NextRequest) {
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
    const userId = await verifyAuth(request);

    const projects = await FirebaseCollections.getAllProjects();

    // Fetch additional data for each project
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const founder = await FirebaseCollections.getUserById(project.founderId);
        const dailyUpdates = await FirebaseCollections.getDailyUpdatesByProject(project.id!);
        const comments = await FirebaseCollections.getCommentsByProject(project.id!);

        return {
          ...project,
          founder,
          dailyUpdates,
          comments,
          teamMembers: [] // TODO: Implement team memberships
        };
      })
    );

    return NextResponse.json(projectsWithDetails);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    // Check if user is a founder
    const user = await FirebaseCollections.getUserById(userId);
    if (!user || user.role !== 'FOUNDER') {
      return NextResponse.json(
        { error: 'Only founders can create projects' },
        { status: 403 }
      );
    }

    const { name, description, pointA, pointB, openToTeamMembers } = await request.json();

    if (!name?.trim() || !description?.trim() || !pointA?.trim() || !pointB?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Set end date to 2 weeks from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    const projectData = {
      name: name.trim(),
      description: description.trim(),
      pointA: pointA.trim(),
      pointB: pointB.trim(),
      openToTeamMembers: openToTeamMembers || false,
      founderId: userId,
      status: 'ACTIVE' as const,
      startDate: new Date(),
      endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const projectId = await FirebaseCollections.createProject(projectData);

    return NextResponse.json({ ...projectData, id: projectId }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
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
