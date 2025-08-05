
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const roleOptions = [
  { value: 'FOUNDER', label: 'Founder', description: 'Building a startup and leading projects' },
  { value: 'EXPERT', label: 'Expert', description: 'Mentoring and providing guidance' },
  { value: 'TEAM_MEMBER', label: 'Team Member', description: 'Looking to join exciting projects' },
];

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    bio: '',
    skills: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.role) {
        throw new Error('Please select a role');
      }

      await signUp(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.role as 'FOUNDER' | 'EXPERT' | 'TEAM_MEMBER'
      );

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center forward-gradient text-white rounded-20 p-8 mb-8 forward-card">
          <div className="flex items-center justify-center mb-4">
            <span className="forward-arrow mr-3">➤</span>
            <h1 className="text-3xl font-black">FORWARD</h1>
          </div>
          <p className="text-lg opacity-90">Join the 2-week accelerator program</p>
        </div>

        {/* Sign Up Form */}
        <div className="forward-card p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <div className="relative mt-2">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="pl-10 min-h-[80px]"
                  placeholder="Tell us about yourself and your experience..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Skills (Optional)</Label>
              <Input
                id="skills"
                type="text"
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                className="mt-2"
                placeholder="React, Product Management, Marketing (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">Separate multiple skills with commas</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                'Creating Account...'
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
