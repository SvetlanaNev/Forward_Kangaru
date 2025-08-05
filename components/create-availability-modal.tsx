
'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateAvailabilityModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
  defaultValues?: {
    startTime?: string;
    endTime?: string;
    isQuickCreate?: boolean;
  };
}

export default function CreateAvailabilityModal({
  onClose,
  onSuccess,
  currentUser,
  defaultValues,
}: CreateAvailabilityModalProps) {
  // Helper function to get default form values
  const getInitialFormData = () => {
    const baseData = {
      title: 'Available for mentoring',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      description: '',
      maxBookings: 1,
      isRecurring: false,
    };

    if (defaultValues?.startTime && defaultValues?.endTime) {
      const startDate = new Date(defaultValues.startTime);
      const endDate = new Date(defaultValues.endTime);
      
      return {
        ...baseData,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5), // HH:mm format
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5), // HH:mm format
      };
    }

    return baseData;
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        setError('End time must be after start time');
        return;
      }

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          description: formData.description,
          maxBookings: formData.maxBookings,
          isRecurring: formData.isRecurring,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create availability');
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

  // Get today's date for minimum date input
  const today = new Date().toISOString().split('T')[0];
  
  // If no end date set, default to same as start date
  const effectiveEndDate = formData.endDate || formData.startDate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-cyan-600" />
            <h2 className="text-xl font-semibold">
              {defaultValues?.isQuickCreate ? 'Quick Add Availability' : 'Add Availability'}
            </h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="e.g., Available for mentoring"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData('startDate', e.target.value)}
                min={today}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => updateFormData('startTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={effectiveEndDate}
                onChange={(e) => updateFormData('endDate', e.target.value)}
                min={formData.startDate || today}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => updateFormData('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxBookings">Maximum Bookings</Label>
            <Select 
              value={formData.maxBookings.toString()} 
              onValueChange={(value) => updateFormData('maxBookings', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 person</SelectItem>
                <SelectItem value="2">2 people</SelectItem>
                <SelectItem value="3">3 people</SelectItem>
                <SelectItem value="4">4 people</SelectItem>
                <SelectItem value="5">5 people</SelectItem>
                <SelectItem value="10">Up to 10 people</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Add details about what you'll cover in this session..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => updateFormData('isRecurring', checked)}
            />
            <Label htmlFor="isRecurring" className="text-sm">
              Make this a recurring availability (weekly)
            </Label>
          </div>

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
              {loading ? 'Creating...' : 'Create Availability'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
