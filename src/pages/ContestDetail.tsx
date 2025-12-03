// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  Trophy, Calendar, Users, Clock, Tag, 
  ArrowLeft, MapPin, Star, Lock, Unlock,
  Play, Pause, CheckCircle, AlertCircle,
  User, Medal, Award, Target, Flag, FileText
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

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  _count?: {
    solves: number;
  };
  solved: boolean;
  createdAt: string;
}

const ContestDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [contest, setContest] = useState<Contest | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchContestData();
  }, [user, id, navigate]);

  const fetchContestData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call to fetch contest data
      setTimeout(() => {
        const mockContest: Contest = {
          id: id || '1',
          name: 'Cyber Security Challenge 2025',
          description: 'A comprehensive cybersecurity competition featuring various challenges in web security, cryptography, reverse engineering, and forensics.',
          startTime: '2025-12-01T09:00:00Z',
          endTime: '2025-12-03T18:00:00Z',
          registrationDeadline: '2025-11-30T23:59:59Z',
          maxParticipants: 100,
          minParticipants: 1,
          isPublic: true,
          isFeatured: true,
          status: 'active',
          category: {
            id: '1',
            name: 'Security',
            color: '#ef4444'
          },
          _count: {
            participants: 42,
            challenges: 15
          },
          createdAt: '2025-11-01T00:00:00Z',
          updatedAt: '2025-11-01T00:00:00Z'
        };

        const mockChallenges: Challenge[] = [
          {
            id: '1',
            title: 'SQL Injection Basics',
            description: 'Exploit a vulnerable login form using SQL injection techniques.',
            points: 100,
            difficulty: 'easy',
            category: {
              id: '1',
              name: 'Web',
              color: '#3b82f6'
            },
            _count: {
              solves: 25
            },
            solved: true,
            createdAt: '2025-11-01T00:00:00Z'
          },
          {
            id: '2',
            title: 'Crypto Cipher',
            description: 'Decrypt a message encrypted with a classical cipher.',
            points: 150,
            difficulty: 'medium',
            category: {
              id: '2',
              name: 'Crypto',
              color: '#10b981'
            },
            _count: {
              solves: 18
            },
            solved: false,
            createdAt: '2025-11-01T00:00:00Z'
          },
          {
            id: '3',
            title: 'Reverse Engineering',
            description: 'Analyze a binary to find the hidden flag.',
            points: 300,
            difficulty: 'hard',
            category: {
              id: '3',
              name: 'Reversing',
              color: '#8b5cf6'
            },
            _count: {
              solves: 5
            },
            solved: false,
            createdAt: '2025-11-01T00:00:00Z'
          }
        ];

        setContest(mockContest);
        setChallenges(mockChallenges);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to load contest data');
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Simulate registration
    setRegistered(true);
  };

  const handleChallengeClick = (challengeId: string) => {
    navigate(`/challenges/${challengeId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'finished': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      case 'insane': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-red-800 font-medium">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button 
            onClick={fetchContestData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-medium">Contest Not Found</h3>
          <p className="mt-2 text-gray-600">The requested contest could not be found.</p>
          <button 
            onClick={() => navigate('/contests')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/contests')}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Contests
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{contest.name}</h1>
      </div>

      {/* Contest Info Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                  <div className="w-2 h-2 rounded-full bg-white mr-1"></div>
                  {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                </span>
                {contest.isFeatured && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                )}
                {!contest.isPublic && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </span>
                )}
              </div>
              <p className="text-gray-600">{contest.description}</p>
            </div>
            
            {!registered ? (
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Register
              </button>
            ) : (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Registered
              </span>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Start Time</span>
              </div>
              <p className="mt-1 font-medium">
                {new Date(contest.startTime).toLocaleDateString()} at {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">End Time</span>
              </div>
              <p className="mt-1 font-medium">
                {new Date(contest.endTime).toLocaleDateString()} at {new Date(contest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Participants</span>
              </div>
              <p className="mt-1 font-medium">
                {contest._count?.participants || 0}/{contest.maxParticipants === 0 ? '∞' : contest.maxParticipants}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Flag className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Challenges</span>
              </div>
              <p className="mt-1 font-medium">{contest._count?.challenges || 0}</p>
            </div>
          </div>

          {/* Category */}
          {contest.category && (
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-gray-400 mr-2" />
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${contest.category.color}20`, color: contest.category.color }}
              >
                {contest.category.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Challenges Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Challenges</h2>
        
        {challenges.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Challenges Available</h3>
            <p className="text-gray-500">There are no challenges in this contest yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleChallengeClick(challenge.id)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 truncate">{challenge.title}</h3>
                    {challenge.solved && (
                      <span className="flex-shrink-0 ml-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                    </span>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-3">{challenge.points} pts</span>
                      <span className="text-xs text-gray-500">{challenge._count?.solves || 0} solves</span>
                    </div>
                  </div>
                  
                  {challenge.category && (
                    <div className="mt-3">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${challenge.category.color}20`, color: challenge.category.color }}
                      >
                        {challenge.category.name}
                      </span>
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

export default ContestDetail;