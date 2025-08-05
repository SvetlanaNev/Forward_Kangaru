
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Video, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import CreateAvailabilityModal from '@/components/create-availability-modal';
import BookSessionModal from '@/components/book-session-modal';

interface CalendarTabProps {
  currentUser: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
}

export default function CalendarTab({ currentUser }: CalendarTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, sessionsRes, expertsRes] = await Promise.all([
        fetch('/api/availability'),
        fetch('/api/sessions'),
        fetch('/api/users?role=EXPERT'),
      ]);

      if (slotsRes.ok) {
        const slots = await slotsRes.json();
        setAvailabilitySlots(slots);
      }

      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json();
        setBookedSessions(sessions);
      }

      if (expertsRes.ok) {
        const expertsData = await expertsRes.json();
        setExperts(expertsData);
        setSelectedExperts(expertsData.map((e: any) => e.id));
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isSlotAvailable = (date: Date, time: string) => {
    const slotDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return availabilitySlots.some(slot => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      if (!selectedExperts.includes(slot.userId)) return false;

      return slotDateTime >= slotStart && slotDateTime < slotEnd;
    });
  };

  const getSlotData = (date: Date, time: string) => {
    const slotDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return availabilitySlots.filter(slot => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      if (!selectedExperts.includes(slot.userId)) return false;

      return slotDateTime >= slotStart && slotDateTime < slotEnd;
    });
  };

  const getBookedSession = (date: Date, time: string) => {
    const slotDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return bookedSessions.find(session => {
      const sessionStart = new Date(session.startTime);
      return Math.abs(sessionStart.getTime() - slotDateTime.getTime()) < 30 * 60 * 1000; // Within 30 minutes
    });
  };

  const handleSlotClick = (slots: any[], day: Date, time: string) => {
    if (slots.length > 0) {
      // If there are availability slots, open booking modal
      setSelectedSlot(slots[0]);
      setShowBookModal(true);
    } else if (canCreateAvailability) {
      // If no slots and user is expert, quick-create availability
      handleQuickCreateAvailability(day, time);
    }
  };

  const handleQuickCreateAvailability = (day: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(day);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30); // Default 30-minute slot

    // Set default values for quick creation
    setSelectedSlot({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isQuickCreate: true
    });
    setShowCreateModal(true);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const toggleExpertSelection = (expertId: string) => {
    setSelectedExperts(prev =>
      prev.includes(expertId)
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    );
  };

  const isCurrentUser = currentUser?.role === 'EXPERT' || currentUser?.role === 'TEAM_MEMBER';
  const canCreateAvailability = currentUser?.role === 'EXPERT';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const weekDays = getWeekDays();
  const timeSlots = getTimeSlots();

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar & Bookings</h2>
          <p className="text-gray-600">
            {canCreateAvailability
              ? 'Set your availability and manage bookings • Click on empty time slots to quickly add availability'
              : 'Book sessions with experts and team members • Click on green slots to book sessions'
            }
          </p>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-1">
            Current Role: {currentUser?.role} | Can Create: {canCreateAvailability ? 'Yes' : 'No'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCreateAvailability && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Availability
            </Button>
          )}
          <Select value={viewMode} onValueChange={(value: 'week' | 'day') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expert Filter */}
      {experts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <h3 className="font-semibold">Filter by Expert</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {experts.map((expert) => (
                <div key={expert.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={expert.id}
                    checked={selectedExperts.includes(expert.id)}
                    onCheckedChange={() => toggleExpertSelection(expert.id)}
                  />
                  <label htmlFor={expert.id} className="flex items-center space-x-2 cursor-pointer">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={expert.image} />
                      <AvatarFallback className="text-xs">
                        {expert.name?.split(' ').map((n: string) => n[0]).join('') || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{expert.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruction Banner for Experts */}
      {canCreateAvailability && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-cyan-600" />
            <p className="text-sm text-cyan-800">
              <strong>Tip:</strong> Click on any empty time slot below to quickly add your availability.
              The "+" icons will appear in empty slots when you hover over them.
            </p>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigateWeek('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold">
          {weekDays[0].toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })} - {weekDays[6].toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <Button variant="outline" onClick={() => navigateWeek('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 border-r bg-gray-50">
              <span className="text-sm font-medium text-gray-600">Time</span>
            </div>
            {weekDays.map((day, index) => (
              <div key={index} className="p-4 text-center border-r last:border-r-0">
                <div className="font-semibold">{formatDate(day)}</div>
              </div>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="p-2 border-r bg-gray-50 text-sm text-gray-600 font-mono">
                  {time}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const slots = getSlotData(day, time);
                  const bookedSession = getBookedSession(day, time);
                  const isAvailable = slots.length > 0;
                  const isEmpty = !isAvailable && !bookedSession;
                  const canClickToCreate = isEmpty && canCreateAvailability;

                  return (
                    <div
                      key={dayIndex}
                      className={`
                        p-2 border-r last:border-r-0 min-h-[60px] relative group
                        ${isAvailable ? 'bg-green-50 hover:bg-green-100 cursor-pointer' : ''}
                        ${bookedSession ? 'bg-blue-100' : ''}
                        ${canClickToCreate ? 'hover:bg-cyan-50 cursor-pointer transition-colors duration-200' : ''}
                        ${isEmpty && !canCreateAvailability ? 'hover:bg-gray-50' : ''}
                      `}
                      onClick={() => handleSlotClick(slots, day, time)}
                      title={
                        isAvailable
                          ? 'Click to book this slot'
                          : canClickToCreate
                            ? 'Click to add availability'
                            : bookedSession
                              ? 'Booked session'
                              : ''
                      }
                    >
                      {bookedSession ? (
                        <div className="text-xs">
                          <div className="font-semibold text-blue-800 truncate">
                            {bookedSession.title}
                          </div>
                          <div className="text-blue-600 flex items-center">
                            <Video className="h-3 w-3 mr-1" />
                            {bookedSession.attendees?.length || 0} attending
                          </div>
                        </div>
                      ) : isAvailable ? (
                        <div className="text-xs">
                          {slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="mb-1">
                              <div className="font-semibold text-green-800 truncate">
                                {slot.user?.name || 'Available'}
                              </div>
                              <div className="text-green-600">
                                {slot.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : canClickToCreate ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="opacity-30 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center text-cyan-600">
                            <Plus className="h-4 w-4 mb-1" />
                            <span className="text-xs font-medium">Add</span>
                          </div>
                        </div>
                      ) : isEmpty ? (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <span className="text-xs">-</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Upcoming Sessions
          </h3>
        </CardHeader>
        <CardContent>
          {bookedSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming sessions</p>
          ) : (
            <div className="space-y-3">
              {bookedSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{session.title}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(new Date(session.startTime))} at {formatTime(new Date(session.startTime))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {session.attendees?.length || 0}
                    </Badge>
                    {session.meetingLink && (
                      <Button
                        size="sm"
                        onClick={() => window.open(session.meetingLink, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateAvailabilityModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSlot(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedSlot(null);
            fetchData();
          }}
          currentUser={currentUser}
          defaultValues={selectedSlot?.isQuickCreate ? selectedSlot : undefined}
        />
      )}

      {showBookModal && selectedSlot && (
        <BookSessionModal
          slot={selectedSlot}
          onClose={() => {
            setShowBookModal(false);
            setSelectedSlot(null);
          }}
          onSuccess={() => {
            setShowBookModal(false);
            setSelectedSlot(null);
            fetchData();
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
