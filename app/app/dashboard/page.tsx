
'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth-guard';
import DashboardClient from './dashboard-client';
import { FirebaseCollections } from '@/lib/firebase-collections';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch all projects
        const projectsData = await FirebaseCollections.getAllProjects();
        
        // For each project, fetch related data
        const projectsWithDetails = await Promise.all(
          projectsData.map(async (project) => {
            // Fetch founder details
            const founder = await FirebaseCollections.getUserById(project.founderId);
            
            // Fetch daily updates
            const dailyUpdates = await FirebaseCollections.getDailyUpdatesByProject(project.id!);
            
            // Fetch comments
            const comments = await FirebaseCollections.getCommentsByProject(project.id!);
            
            // For now, we'll skip team members as it requires additional implementation
            return {
              ...project,
              founder,
              dailyUpdates,
              comments,
              teamMembers: [] // TODO: Implement team memberships
            };
          })
        );

        setProjects(projectsWithDetails);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardClient 
        projects={projects} 
        currentUser={user}
      />
    </AuthGuard>
  );
}
