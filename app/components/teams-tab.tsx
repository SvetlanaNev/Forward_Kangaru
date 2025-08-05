
'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeamsTabProps {
  currentUser: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
  projects: any[];
}

export default function TeamsTab({ currentUser, projects }: TeamsTabProps) {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, availabilityFilter, allUsers]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        setAllUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = allUsers.filter(user => user.id !== currentUser.id);

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (availabilityFilter === 'open') {
      filtered = filtered.filter(user => user.openToTeam);
    }

    setFilteredUsers(filtered);
  };

  const toggleAvailability = async () => {
    try {
      const response = await fetch('/api/users/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        // Refresh the page to get updated user status
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FOUNDER': return 'bg-blue-100 text-blue-800';
      case 'EXPERT': return 'bg-purple-100 text-purple-800';
      case 'TEAM_MEMBER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'FOUNDER': return 'Founder';
      case 'EXPERT': return 'Expert';
      case 'TEAM_MEMBER': return 'Team Member';
      default: return role;
    }
  };

  const getUserProject = (userId: string) => {
    return projects.find(project => 
      project.founder.id === userId || 
      project.teamMembers.some((tm: any) => tm.user.id === userId)
    );
  };

  const currentUserData = allUsers.find(user => user.id === currentUser.id);
  const isCurrentUserOpen = currentUserData?.openToTeam;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Status Card */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUserData?.image} />
                <AvatarFallback>
                  {currentUser.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Your Team Status</h3>
                <p className="text-sm text-gray-600">Manage your availability for collaboration</p>
              </div>
            </div>
            <Button
              onClick={toggleAvailability}
              variant={isCurrentUserOpen ? "default" : "outline"}
              className={isCurrentUserOpen ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isCurrentUserOpen ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Open to Collaborate
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Mark as Available
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge className={getRoleColor(currentUser.role)}>
              {getRoleLabel(currentUser.role)}
            </Badge>
            {isCurrentUserOpen && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                ✓ Available for new projects
              </Badge>
            )}
          </div>
          {currentUserData?.bio && (
            <p className="text-sm text-gray-600 mt-2">{currentUserData.bio}</p>
          )}
          {currentUserData?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {currentUserData.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="FOUNDER">Founders</SelectItem>
            <SelectItem value="EXPERT">Experts</SelectItem>
            <SelectItem value="TEAM_MEMBER">Team Members</SelectItem>
          </SelectContent>
        </Select>
        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="open">Available to Join</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const userProject = getUserProject(user.id);
          
          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {user.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      {user.openToTeam && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                )}
                
                {user.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {user.skills.slice(0, 3).map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {user.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{user.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {userProject && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs font-medium text-gray-700">Current Project:</p>
                    <p className="text-sm text-gray-900 truncate">{userProject.name}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="mr-1 h-3 w-3" />
                    Message
                  </Button>
                  {user.role === 'EXPERT' && (
                    <Button size="sm" variant="outline">
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or filters to find more people.
          </p>
        </div>
      )}
    </div>
  );
}
