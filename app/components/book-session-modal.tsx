
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookSessionModalProps {
  slot: any;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
}

export default function BookSessionModal({
  slot,
  onClose,
  onSuccess,
  currentUser,
}: BookSessionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    attendeeIds: [] as string[],
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        setTeamMembers(users.filter((user: any) => user.id !== currentUser.id && user.id !== slot.userId));
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availabilitySlotId: slot.id,
          title: formData.title || `Meeting with ${slot.user.name}`,
          description: formData.description,
          projectId: formData.projectId || null,
          attendeeIds: formData.attendeeIds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book session');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAttendee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      attendeeIds: prev.attendeeIds.includes(userId)
        ? prev.attendeeIds.filter(id => id !== userId)
        : [...prev.attendeeIds, userId]
    }));
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-cyan-600" />
            <h2 className="text-xl font-semibold">Book Session</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Session Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={slot.user.image} />
                <AvatarFallback>
                  {slot.user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{slot.user.name}</h3>
                <p className="text-sm text-gray-600">{slot.title}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {formatDateTime(startTime)}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Duration: {duration} minutes
              </div>
              {slot.meetingLink && (
                <div className="flex items-center text-gray-600">
                  <Video className="h-4 w-4 mr-2" />
                  Video call link will be provided
                </div>
              )}
            </div>
            {slot.description && (
              <p className="text-sm text-gray-600 mt-2">{slot.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder={`Meeting with ${slot.user.name}`}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="What would you like to discuss in this session?"
                rows={3}
              />
            </div>

            {projects.length > 0 && (
              <div>
                <Label htmlFor="projectId">Related Project (Optional)</Label>
                <Select 
                  value={formData.projectId} 
                  onValueChange={(value) => updateFormData('projectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {teamMembers.length > 0 && (
              <div>
                <Label>Invite Team Members (Optional)</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={member.id}
                        checked={formData.attendeeIds.includes(member.id)}
                        onCheckedChange={() => toggleAttendee(member.id)}
                      />
                      <label htmlFor={member.id} className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.image} />
                          <AvatarFallback className="text-xs">
                            {member.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Book Session'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
