
'use client';

import { useState } from 'react';
import { X, Edit, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProjectModalProps {
  project: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    pointA: project?.pointA || '',
    pointB: project?.pointB || '',
    openToTeamMembers: project?.openToTeamMembers || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="forward-gradient text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Edit className="h-6 w-6 mr-3" />
                <h2 className="text-2xl font-bold">Edit Project</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-lg opacity-90 mt-2">Update your project details</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name" className="text-base font-medium">Project Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">Project Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="mt-2 min-h-[100px]"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pointA" className="text-base font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-600" />
                  Point A - Current State
                </Label>
                <Textarea
                  id="pointA"
                  value={formData.pointA}
                  onChange={(e) => handleChange('pointA', e.target.value)}
                  className="mt-2 min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pointB" className="text-base font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-600" />
                  Point B - 2-Week Goal
                </Label>
                <Textarea
                  id="pointB"
                  value={formData.pointB}
                  onChange={(e) => handleChange('pointB', e.target.value)}
                  className="mt-2 min-h-[120px]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="openToTeamMembers"
                checked={formData.openToTeamMembers}
                onCheckedChange={(checked) => handleChange('openToTeamMembers', checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="openToTeamMembers" className="text-base font-medium flex items-center cursor-pointer">
                  <Users className="h-4 w-4 mr-2" />
                  Open to Team Members
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Allow other participants to request to join your project
                </p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
