
'use client';

import { useState } from 'react';
import { MessageCircle, Send, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentsSectionProps {
  projectId: string;
  comments: any[];
  currentUser: any;
  onClose: () => void;
}

export default function CommentsSection({ projectId, comments, currentUser, onClose }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment?.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          projectId,
        }),
      });

      if (response.ok) {
        setNewComment('');
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ')?.map(n => n?.[0])?.join('').toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'FOUNDER':
        return 'bg-blue-100 text-blue-800';
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800';
      case 'TEAM_MEMBER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-6 border-t border-gray-200 pt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Comments ({comments?.length || 0})
          </h4>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {comments?.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments?.map((comment: any) => (
              <motion.div
                key={comment?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm">
                    {getInitials(comment?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {comment?.user?.name}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(comment?.user?.role)}`}>
                      {comment?.user?.role?.toLowerCase()?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment?.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm">
                {getInitials(currentUser?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts, feedback, or questions..."
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment?.trim() || isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {isSubmitting ? (
                'Posting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
