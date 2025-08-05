
'use client';

import { useState } from 'react';
import { X, Calendar, Target, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyUpdateModalProps {
  projectId: string;
  currentDay: number;
  existingUpdate?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DailyUpdateModal({
  projectId,
  currentDay,
  existingUpdate,
  onClose,
  onSuccess,
}: DailyUpdateModalProps) {
  const [formData, setFormData] = useState({
    wantToDoToday: existingUpdate?.wantToDoToday || '',
    whatDid: existingUpdate?.whatDid || '',
    challenges: existingUpdate?.challenges || '',
    nextSteps: existingUpdate?.nextSteps || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingUpdate;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = isEditing 
        ? `/api/daily-updates/${existingUpdate.id}`
        : '/api/daily-updates';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const body = isEditing 
        ? formData
        : { ...formData, projectId, day: currentDay };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
                <Calendar className="h-6 w-6 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {isEditing ? 'Edit' : 'Add'} Daily Update
                  </h2>
                  <p className="text-lg opacity-90">Day {currentDay} Progress</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Daily Structure Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Daily Update Structure
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                <div>• What you want to do today</div>
                <div>• What you actually accomplished</div>
                <div>• Challenges faced (optional)</div>
                <div>• Next steps planned (optional)</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="wantToDoToday" className="text-base font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2 text-orange-600" />
                  Want to Do Today
                </Label>
                <Textarea
                  id="wantToDoToday"
                  value={formData.wantToDoToday}
                  onChange={(e) => handleChange('wantToDoToday', e.target.value)}
                  placeholder="What are your goals and tasks for today?"
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="whatDid" className="text-base font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  What Did You Do
                </Label>
                <Textarea
                  id="whatDid"
                  value={formData.whatDid}
                  onChange={(e) => handleChange('whatDid', e.target.value)}
                  placeholder="What did you accomplish today?"
                  className="mt-2 min-h-[120px]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="challenges" className="text-base font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                  Challenges (Optional)
                </Label>
                <Textarea
                  id="challenges"
                  value={formData.challenges}
                  onChange={(e) => handleChange('challenges', e.target.value)}
                  placeholder="What obstacles or challenges did you face?"
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="nextSteps" className="text-base font-medium flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-blue-600" />
                  Next Steps (Optional)
                </Label>
                <Textarea
                  id="nextSteps"
                  value={formData.nextSteps}
                  onChange={(e) => handleChange('nextSteps', e.target.value)}
                  placeholder="What are your next planned actions?"
                  className="mt-2 min-h-[100px]"
                />
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
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Saving...') 
                  : (isEditing ? 'Update' : 'Save Update')
                }
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
