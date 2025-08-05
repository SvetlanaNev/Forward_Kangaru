
'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { PlusCircle, LogOut, Settings, Users, Calendar, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectCard from '@/components/project-card';
import Header from '@/components/header';
import CreateProjectModal from '@/components/create-project-modal';
import TeamsTab from '@/components/teams-tab';
import CalendarTab from '@/components/calendar-tab';

interface DashboardClientProps {
  projects: any[];
  currentUser: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export default function DashboardClient({ projects, currentUser }: DashboardClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('projects');

  const handleProjectCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    window.location.reload(); // Simple refresh for now
  };

  const isFounder = currentUser?.role === 'FOUNDER';
  const userProjects = projects?.filter(p => p?.founder?.id === currentUser?.id) || [];
  const otherProjects = projects?.filter(p => p?.founder?.id !== currentUser?.id) || [];

  return (
    <div className="min-h-screen">
      <Header currentUser={currentUser} />
      
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.name?.split(' ')?.[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            {isFounder 
              ? 'Track your projects and daily progress in the 2-week sprint.'
              : currentUser?.role === 'EXPERT'
              ? 'Mentor founders and provide valuable insights on their projects.'
              : 'Discover exciting projects and connect with innovative teams.'
            }
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Teams</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-8">
            {/* Quick Actions for Projects */}
            <div className="flex flex-wrap gap-4">
              {isFounder && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              )}
            </div>

            {/* User's Projects */}
            {isFounder && userProjects?.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Projects</h2>
                <div className="space-y-8">
                  {userProjects?.map((project) => (
                    <ProjectCard
                      key={project?.id}
                      project={project}
                      currentUser={currentUser}
                      isOwner={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Projects */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isFounder ? 'Other Projects' : 'All Projects'}
              </h2>
              {(isFounder ? otherProjects : projects)?.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-4">
                    {isFounder 
                      ? 'Be the first to create a project for the accelerator program!'
                      : 'Check back soon for exciting new projects to explore.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {(isFounder ? otherProjects : projects)?.map((project) => (
                    <ProjectCard
                      key={project?.id}
                      project={project}
                      currentUser={currentUser}
                      isOwner={project?.founder?.id === currentUser?.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <TeamsTab currentUser={currentUser} projects={projects} />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <CalendarTab currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
