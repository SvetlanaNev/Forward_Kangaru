
'use client';

import { Calendar, Clock, Target, AlertTriangle, ArrowRight, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyUpdateCardProps {
  day: number;
  update: any;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isOwner: boolean;
  projectId: string;
  currentUser: any;
  onUpdateClick: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export default function DailyUpdateCard({
  day,
  update,
  isToday,
  isPast,
  isFuture,
  isOwner,
  onUpdateClick,
  expanded,
  onToggleExpand,
}: DailyUpdateCardProps) {
  const getCardStyle = () => {
    if (isToday && update) return 'progress-card active'; // Today with update
    if (isToday && !update) return 'border-2 border-orange-300 bg-orange-50'; // Today without update
    if (isPast && update) return 'progress-card'; // Past with update - using the new pastel style
    if (isPast && !update) return 'bg-red-50 border border-red-200'; // Past without update
    return 'bg-gray-50 border border-gray-200'; // Future
  };

  const getIcon = () => {
    if (update) return <CheckCircle className="h-5 w-5 text-blue-600" />;
    if (isToday) return <Clock className="h-5 w-5 text-orange-600" />;
    if (isPast) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    return <Calendar className="h-5 w-5 text-gray-400" />;
  };

  const getStatus = () => {
    if (update) return 'Complete';
    if (isToday) return 'Today';
    if (isPast) return 'Missed';
    return 'Upcoming';
  };

  const getStatusColor = () => {
    if (update) return 'text-blue-600';
    if (isToday) return 'text-orange-600';
    if (isPast) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div 
      className={`flex-shrink-0 w-64 ${getCardStyle()} p-4 rounded-lg cursor-pointer transition-all duration-300 ${
        expanded ? 'ring-2 ring-cyan-500' : ''
      }`}
      onClick={onToggleExpand}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold flex items-center">
          {getIcon()}
          <span className="ml-2">Day {day}</span>
        </h4>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatus()}
        </span>
      </div>

      {update ? (
        <div className="space-y-3">
          {update?.wantToDoToday && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Planned</p>
              <p className={`text-sm ${expanded ? '' : 'line-clamp-2'}`}>
                {update.wantToDoToday}
              </p>
            </div>
          )}

          {update?.whatDid && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
              <p className={`text-sm ${expanded ? '' : 'line-clamp-2'}`}>
                {update.whatDid}
              </p>
            </div>
          )}

          {expanded && (
            <>
              {update?.challenges && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Challenges</p>
                  <p className="text-sm">{update.challenges}</p>
                </div>
              )}

              {update?.nextSteps && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Next Steps</p>
                  <p className="text-sm">{update.nextSteps}</p>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Updated by {update?.user?.name} on{' '}
                  {new Date(update?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          {isToday && isOwner ? (
            <>
              <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">Ready to start today?</p>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateClick();
                }}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Update
              </Button>
            </>
          ) : isFuture ? (
            <>
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Coming up</p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-600">No update</p>
            </>
          )}
        </div>
      )}

      {expanded && isOwner && update && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateClick();
            }}
            className="w-full"
          >
            Edit Update
          </Button>
        </div>
      )}
    </div>
  );
}
