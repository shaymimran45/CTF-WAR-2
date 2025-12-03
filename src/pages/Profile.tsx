// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  User, Trophy, Calendar, Hash, Shield, 
  Edit, Award, Target, Clock, CheckCircle
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  awardedAt: string;
}

interface Statistic {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      // Simulate API call - in a real app, this would fetch from your backend
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'First Blood',
          description: 'Solved your first challenge',
          awardedAt: new Date(Date.now() - 86400000 * 7).toISOString()
        },
        {
          id: '2',
          name: 'Speed Demon',
          description: 'Solved a challenge in under 5 minutes',
          awardedAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: '3',
          name: 'Category Master',
          description: 'Solved challenges in 5 different categories',
          awardedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setAchievements(mockAchievements);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page
    console.log('Edit profile clicked');
  };

  const statistics: Statistic[] = [
    {
      label: 'Challenges Solved',
      value: user?._count?.solves || 0,
      icon: <Target className="h-5 w-5" />,
      color: 'text-green-400'
    },
    {
      label: 'Total Points',
      value: (user?._count?.solves || 0) * 100,
      icon: <Trophy className="h-5 w-5" />,
      color: 'text-yellow-400'
    },
    {
      label: 'Submissions',
      value: user?._count?.submissions || 0,
      icon: <Hash className="h-5 w-5" />,
      color: 'text-blue-400'
    },
    {
      label: 'Member Since',
      value: user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-purple-400'
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 header-horror">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white horror-title">Profile</h1>
              <div className="mt-2 horror-divider"></div>
              <p className="text-gray-400 mt-1">
                Manage your account and track your progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Shield className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Info Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-6">
                <div className="bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {statistics.map((stat, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-700 ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { action: 'Solved challenge', target: 'SQL Injection Basics', time: '2 hours ago', points: 100 },
                  { action: 'Submitted flag', target: 'XSS Challenge', time: '1 day ago', points: 0 },
                  { action: 'Joined team', target: 'Hackers United', time: '3 days ago', points: 0 },
                  { action: 'Solved challenge', target: 'Buffer Overflow', time: '1 week ago', points: 300 }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                    <div>
                      <p className="font-medium text-white">
                        {activity.action} <span className="text-gray-400">•</span> {activity.target}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    {activity.points > 0 && (
                      <div className="flex items-center text-green-400">
                        <Trophy className="h-4 w-4 mr-1" />
                        <span className="font-medium">+{activity.points}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Achievements ({achievements.length})
              </h3>
              
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p>No achievements yet</p>
                  <p className="text-sm mt-1">Keep solving challenges to earn badges!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <div className="mt-1 p-2 bg-yellow-900/20 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{achievement.name}</h4>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Awarded {new Date(achievement.awardedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Summary */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Progress Summary
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Web Challenges</span>
                    <span className="text-white">5/12</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Crypto Challenges</span>
                    <span className="text-white">3/8</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '38%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Reverse Engineering</span>
                    <span className="text-white">2/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;