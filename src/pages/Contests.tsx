// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  Trophy, Calendar, Users, Clock, Tag, 
  ArrowLeft, MapPin, Star, Lock, Unlock,
  Play, Pause, CheckCircle, AlertCircle
} from 'lucide-react';

interface Contest {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  registrationDeadline?: string;
  maxParticipants: number;
  minParticipants: number;
  isPublic: boolean;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'active' | 'paused' | 'finished' | 'cancelled';
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  _count?: {
    participants: number;
    challenges: number;
  };
  createdAt: string;
  updatedAt: string;
}

const Contests: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'finished'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchContests();
  }, [user, navigate]);

  const fetchContests = async () => {
    try {
      // Simulate API call - in a real app, this would fetch from your backend
      const mockContests: Contest[] = [
        {
          id: '1',
          name: 'Holiday Hackathon',
          description: 'A festive challenge to test your skills during the holidays',
          startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          endTime: new Date(Date.now() + 7 * 86400000).toISOString(), // Next week
          registrationDeadline: new Date(Date.now() + 82800000).toISOString(), // Tomorrow minus 1 hour
          maxParticipants: 100,
          minParticipants: 1,
          isPublic: true,
          isFeatured: true,
          status: 'published',
          category: {
            id: '1',
            name: 'Beginner',
            color: '#10b981'
          },
          _count: {
            participants: 42,
            challenges: 15
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Advanced Exploitation',
          description: 'Hardcore challenges for experienced players',
          startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          endTime: new Date(Date.now() + 24 * 86400000).toISOString(), // 24 days from now
          maxParticipants: 50,
          minParticipants: 1,
          isPublic: true,
          isFeatured: false,
          status: 'active',
          category: {
            id: '2',
            name: 'Advanced',
            color: '#ef4444'
          },
          _count: {
            participants: 28,
            challenges: 25
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Crypto Championship',
          description: 'Test your cryptography skills in this intense competition',
          startTime: new Date(Date.now() - 7 * 86400000).toISOString(), // Last week
          endTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          maxParticipants: 75,
          minParticipants: 1,
          isPublic: true,
          isFeatured: false,
          status: 'finished',
          category: {
            id: '3',
            name: 'Special Event',
            color: '#8b5cf6'
          },
          _count: {
            participants: 63,
            challenges: 12
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setContests(mockContests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'published': return 'text-blue-400 bg-blue-400/10';
      case 'finished': return 'text-gray-400 bg-gray-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'published': return 'Open';
      case 'finished': return 'Finished';
      case 'paused': return 'Paused';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredContests = contests.filter(contest => {
    // Apply status filter
    if (filter !== 'all') {
      if (filter === 'active' && contest.status !== 'active') return false;
      if (filter === 'upcoming' && new Date(contest.startTime) > new Date()) return false;
      if (filter === 'finished' && contest.status !== 'finished') return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        contest.name.toLowerCase().includes(term) ||
        contest.description.toLowerCase().includes(term) ||
        (contest.category?.name.toLowerCase().includes(term) || false)
      );
    }
    
    return true;
  });

  const goBack = () => navigate(-1);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 header-horror">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={goBack} className="px-2 py-1 rounded btn-blood flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-white horror-title">Contests</h1>
              <div className="mt-2 horror-divider"></div>
              <p className="text-gray-400 mt-1">
                Participate in exciting CTF competitions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Active Contests</p>
                <p className="text-2xl font-bold text-red-400">
                  {contests.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent card-horror"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  filter === 'active' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  filter === 'upcoming' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('finished')}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  filter === 'finished' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Finished
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        )}

        {/* Contests Grid */}
        {!loading && filteredContests.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No contests found</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No contests available at the moment'
              }
            </p>
          </div>
        )}

        {!loading && filteredContests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map(contest => (
              <div
                key={contest.id}
                className="card-horror border rounded-lg p-6 transition-all cursor-pointer hover:border-red-500"
                onClick={() => navigate(`/contests/${contest.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {contest.isFeatured && (
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      )}
                      {contest.isPublic ? (
                        <Unlock className="h-4 w-4 text-green-400" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <h3 className="text-lg font-semibold text-white group-hover:text-red-400">
                        {contest.name}
                      </h3>
                    </div>
                    {contest.category && (
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs text-white" 
                        style={{ backgroundColor: contest.category.color }}
                      >
                        {contest.category.name}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                    {getStatusText(contest.status)}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {contest.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <div>
                      <div>{formatDate(contest.startTime)}</div>
                      <div className="text-xs">{formatTime(contest.startTime)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <div>
                      {new Date(contest.startTime) > new Date() ? (
                        <div>Starts in {getTimeRemaining(contest.startTime)}</div>
                      ) : (
                        <div>Ends in {getTimeRemaining(contest.endTime)}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{contest._count?.participants || 0}/{contest.maxParticipants || '∞'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>{contest._count?.challenges || 0} challenges</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/contests/${contest.id}`);
                    }}
                  >
                    {contest.status === 'active' ? 'Join Now' : 'View Details'}
                  </button>
                  
                  {contest.status === 'active' && (
                    <div className="flex items-center text-green-400 text-sm">
                      <Play className="h-4 w-4 mr-1" />
                      <span>Live</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contests;