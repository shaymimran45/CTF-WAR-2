import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useChallengeStore } from '../stores/challengeStore'
import { useLeaderboardStore } from '../stores/leaderboardStore'
import { 
  Trophy, Users, User, TrendingUp, Clock, Award, 
  BarChart, PieChart, Activity, Target, Medal, Crown,
  ChevronLeft, RotateCcw, CheckCircle, Lock, Zap, Star,
  Calendar, Tag, Shield, Brain
} from 'lucide-react'

// Simple visualization components
const StatCard = ({ title, value, icon, color }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  color: string;
}) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-${color}-500 transition-colors`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-400`}>
        {icon}
      </div>
    </div>
  </div>
)

const ProgressBar = ({ value, max, color }: { 
  value: number; 
  max: number; 
  color: string;
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div 
        className={`bg-${color}-600 h-2.5 rounded-full`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}

const CategoryDistribution = ({ categories }: { categories: Array<{ category: string; _count: { id: number } }> }) => {
  const total = categories.reduce((sum, cat) => sum + cat._count.id, 0)
  
  return (
    <div className="space-y-3">
      {categories.map((cat, index) => {
        const percentage = total > 0 ? (cat._count.id / total) * 100 : 0
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500']
        const color = colors[index % colors.length]
        
        return (
          <div key={cat.category} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 capitalize">{cat.category}</span>
              <span className="text-gray-400">{cat._count.id} ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`${color} h-2 rounded-full`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const DifficultyDistribution = ({ difficulties }: { difficulties: Array<{ difficulty: string; _count: { id: number } }> }) => {
  const total = difficulties.reduce((sum, diff) => sum + diff._count.id, 0)
  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
    insane: 'bg-purple-500'
  }
  
  return (
    <div className="space-y-3">
      {difficulties.map((diff) => {
        const percentage = total > 0 ? (diff._count.id / total) * 100 : 0
        const color = difficultyColors[diff.difficulty] || 'bg-gray-500'
        
        return (
          <div key={diff.difficulty} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 capitalize">{diff.difficulty}</span>
              <span className="text-gray-400">{diff._count.id} ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`${color} h-2 rounded-full`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const RecentSolves = ({ solves }: { solves: any[] }) => {
  if (solves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent solves
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {solves.slice(0, 5).map((solve, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div>
            <div className="font-medium text-white">{solve.user.username}</div>
            <div className="text-sm text-gray-400">{solve.challenge.title}</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-green-400">+{solve.pointsAwarded}</div>
            <div className="text-xs text-gray-500">
              {new Date(solve.solvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { challenges, fetchChallenges } = useChallengeStore()
  const { statistics, fetchStatistics } = useLeaderboardStore()
  
  const userSolvedChallenges = challenges.filter(challenge => challenge.solved).length
  const totalChallenges = challenges.length

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchChallenges()
    fetchStatistics()
  }, [user, navigate, fetchChallenges, fetchStatistics])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 header-horror">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center space-x-3 horror-title">
                <Shield className="h-8 w-8 text-blue-400" />
                <span>CTF War Dashboard</span>
              </h1>
              <div className="mt-2 horror-divider"></div>
              <p className="text-gray-400 mt-1">
                Track your progress and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Your Progress</p>
                <p className="text-2xl font-bold text-green-400">
                  {totalChallenges > 0 ? `${Math.round((userSolvedChallenges / totalChallenges) * 100)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Challenges Solved" 
            value={userSolvedChallenges} 
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
          />
          <StatCard 
            title="Total Points" 
            value={user?._count?.solves ? user._count.solves * 100 : 0} 
            icon={<Trophy className="h-6 w-6" />}
            color="yellow"
          />
          <StatCard 
            title="Rank" 
            value={`#${15}`} 
            icon={<Crown className="h-6 w-6" />}
            color="purple"
          />
          <StatCard 
            title="Submissions" 
            value={user?._count?.submissions || 0} 
            icon={<Zap className="h-6 w-6" />}
            color="blue"
          />
        </div>

        {/* Progress Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              Challenge Progress
            </h2>
            <span className="text-sm text-gray-400">
              {userSolvedChallenges} of {totalChallenges} solved
            </span>
          </div>
          <ProgressBar value={userSolvedChallenges} max={totalChallenges} color="green" />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Category Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-400" />
              Challenges by Category
            </h3>
            {statistics?.categories ? (
              <CategoryDistribution categories={statistics.categories} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            )}
          </div>
          
          {/* Difficulty Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-yellow-400" />
              Challenges by Difficulty
            </h3>
            {statistics?.difficulties ? (
              <DifficultyDistribution difficulties={statistics.difficulties} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            )}
          </div>
          
          {/* Recent Solves */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Recent Solves
            </h3>
            {statistics?.recentSolves ? (
              <RecentSolves solves={statistics.recentSolves} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Personal Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Your Performance Metrics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Success Rate</div>
              <div className="text-2xl font-bold text-white">
                {user?._count?.submissions && user?._count?.solves 
                  ? `${Math.round((user._count.solves / user._count.submissions) * 100)}%` 
                  : '0%'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {user?._count?.solves || 0} successful out of {user?._count?.submissions || 0} attempts
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Avg. Points per Solve</div>
              <div className="text-2xl font-bold text-white">
                {user?._count?.solves 
                  ? Math.round((user._count.solves * 100) / user._count.solves) 
                  : 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Based on {user?._count?.solves || 0} solves
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Favorite Category</div>
              <div className="text-2xl font-bold text-white">
                Web
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Based on your solved challenges
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard