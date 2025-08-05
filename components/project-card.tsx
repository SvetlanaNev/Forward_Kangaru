
'use client';

import { useState } from 'react';
import { Calendar, Users, MessageCircle, Edit, Clock, Target, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DailyUpdateCard from './daily-update-card';
import ProgressBar from './progress-bar';
import CommentsSection from './comments-section';
import EditProjectModal from './edit-project-modal';
import DailyUpdateModal from './daily-update-modal';

interface ProjectCardProps {
  project: any;
  currentUser: any;
  isOwner: boolean;
}

export default function ProjectCard({ project, currentUser, isOwner }: ProjectCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const getDaysRemaining = () => {
    if (!project?.endDate) return 14;
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(14, diffDays));
  };

  const getCurrentDay = () => {
    if (!project?.startDate) return 1;
    const today = new Date();
    const startDate = new Date(project.startDate);
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(14, diffDays));
  };

  const dailyUpdates = project?.dailyUpdates || [];
  const teamMembers = project?.teamMembers || [];
  const comments = project?.comments || [];
  const currentDay = getCurrentDay();
  const daysRemaining = getDaysRemaining();

  // Generate array for all 14 days
  const allDays = Array.from({ length: 14 }, (_, index) => {
    const day = index + 1;
    const update = dailyUpdates?.find((u: any) => u?.day === day);
    return {
      day,
      update,
      isToday: day === currentDay,
      isPast: day < currentDay,
      isFuture: day > currentDay,
    };
  });

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="forward-card p-6 mb-8">
      {/* Progress Bar */}
      <ProgressBar 
        currentDay={currentDay} 
        totalDays={14} 
        daysRemaining={daysRemaining}
        className="mb-6"
      />

      {/* Horizontal Card Layout */}
      <div className="flex overflow-x-auto horizontal-scroll gap-6 pb-4">
        {/* Project Card */}
        <div 
          className={`flex-shrink-0 w-80 progress-card p-6 rounded-lg cursor-pointer transition-all duration-300 ${
            expandedCard === 'project' ? 'ring-2 ring-cyan-500' : ''
          }`}
          onClick={() => toggleCardExpansion('project')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 truncate">{project?.name}</h3>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="opacity-70 hover:opacity-100"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Target className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Point A</p>
                <p className={`text-sm text-gray-600 ${expandedCard === 'project' ? '' : 'line-clamp-2'}`}>
                  {project?.pointA}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <ChevronRight className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Point B</p>
                <p className={`text-sm text-gray-600 ${expandedCard === 'project' ? '' : 'line-clamp-2'}`}>
                  {project?.pointB}
                </p>
              </div>
            </div>

            {expandedCard === 'project' && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                <p className="text-sm text-gray-600">{project?.description}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{daysRemaining} days left</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">{comments?.length || 0}</span>
            </Button>
          </div>
        </div>

        {/* Team Card */}
        <div 
          className={`flex-shrink-0 w-64 progress-card p-6 rounded-lg cursor-pointer transition-all duration-300 ${
            expandedCard === 'team' ? 'ring-2 ring-cyan-500' : ''
          }`}
          onClick={() => toggleCardExpansion('team')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team
            </h3>
            {project?.openToTeamMembers && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Open
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Founder */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {project?.founder?.name?.split(' ')?.map((n: string) => n?.[0])?.join('') || 'F'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {project?.founder?.name}
                </p>
                <p className="text-xs text-gray-500">Founder</p>
              </div>
            </div>

            {/* Team Members */}
            {teamMembers?.length > 0 ? (
              teamMembers?.map((member: any) => (
                <div key={member?.id} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-500 text-white text-sm">
                      {member?.user?.name?.split(' ')?.map((n: string) => n?.[0])?.join('') || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{member?.role}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No team members yet</p>
                {project?.openToTeamMembers && (
                  <p className="text-xs text-gray-400 mt-1">Looking for team members</p>
                )}
              </div>
            )}

            {expandedCard === 'team' && currentUser?.role === 'TEAM_MEMBER' && (
              <Button size="sm" className="w-full mt-3">
                <Plus className="h-4 w-4 mr-2" />
                Request to Join
              </Button>
            )}
          </div>
        </div>

        {/* Daily Progress Cards */}
        {allDays?.map((dayInfo) => (
          <DailyUpdateCard
            key={dayInfo.day}
            day={dayInfo.day}
            update={dayInfo.update}
            isToday={dayInfo.isToday}
            isPast={dayInfo.isPast}
            isFuture={dayInfo.isFuture}
            isOwner={isOwner}
            projectId={project?.id}
            currentUser={currentUser}
            onUpdateClick={() => setShowUpdateModal(true)}
            expanded={expandedCard === `day-${dayInfo.day}`}
            onToggleExpand={() => toggleCardExpansion(`day-${dayInfo.day}`)}
          />
        ))}
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentsSection
          projectId={project?.id}
          comments={comments}
          currentUser={currentUser}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Modals */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
        />
      )}

      {showUpdateModal && (
        <DailyUpdateModal
          projectId={project?.id}
          currentDay={currentDay}
          existingUpdate={dailyUpdates?.find((u: any) => u?.day === currentDay)}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={() => {
            setShowUpdateModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
