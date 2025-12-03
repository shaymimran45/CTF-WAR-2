import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeaderboardStore } from '../stores/leaderboardStore'
import { useAuthStore } from '../stores/authStore'
import { 
  Trophy, Users, User, TrendingUp, Clock, Award, 
  BarChart, PieChart, Activity, Target, Medal, Crown,
  ChevronLeft, RotateCcw
} from 'lucide-react'

// Simple chart components since we can't use external libraries
const BarChartComponent = ({ data }: { data: { name: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1)
  
  return (
    <div className="w-full h-64 flex items-end space-x-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="text-xs text-gray-400 mb-1">{item.value}</div>
          <div 
            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-500 hover:to-blue-300 transition-all"
            style={{ height: `${(item.value / maxValue) * 90}%` }}
          />
          <div className="text-xs text-gray-400 mt-1 truncate w-full text-center">{item.name}</div>
        </div>
      ))}
    </div>
  )
}

const PieChartComponent = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
  let startAngle = 0
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  if (total === 0) {
    return (
      <div className="w-48 h-48 rounded-full bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500">No data</span>
      </div>
    )
  }
  
  return (
    <div className="relative w-48 h-48">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const angle = (percentage / 100) * 360
          const endAngle = startAngle + angle
          
          // Convert angles to radians
          const startRad = (startAngle - 90) * Math.PI / 180
          const endRad = (endAngle - 90) * Math.PI / 180
          
          // Calculate coordinates
          const x1 = 50 + 40 * Math.cos(startRad)
          const y1 = 50 + 40 * Math.sin(startRad)
          const x2 = 50 + 40 * Math.cos(endRad)
          const y2 = 50 + 40 * Math.sin(endRad)
          
          // Large arc flag
          const largeArc = angle > 180 ? 1 : 0
          
          const pathData = `
            M 50 50
            L ${x1} ${y1}
            A 40 40 0 ${largeArc} 1 ${x2} ${y2}
            Z
          `
          
          startAngle = endAngle
          
          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="#1f2937"
              strokeWidth="0.5"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
      </div>
    </div>
  )
}

const LineChartComponent = ({ data }: { data: { time: string; score: number }[] }) => {
  if (data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-gray-500">
        No data available
      </div>
    )
  }
  
  const maxScore = Math.max(...data.map(d => d.score), 1)
  const minScore = Math.min(...data.map(d => d.score), 0)
  const scoreRange = maxScore - minScore || 1
  
  return (
    <div className="w-full h-48 relative">
      <div className="absolute inset-0 flex flex-col">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="absolute w-full border-t border-gray-700"
            style={{ bottom: `${(i / 4) * 100}%` }}
          >
            <span className="absolute left-0 text-xs text-gray-500 -mt-2">
              {Math.round(minScore + (scoreRange * (i / 4)))}
            </span>
          </div>
        ))}
        
        {/* Data line */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((point.score - minScore) / scoreRange) * 100
              return `${x},${y}`
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((point.score - minScore) / scoreRange) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="#3b82f6"
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}

const GraphicalLeaderboard: React.FC = () => {
  const navigate = useNavigate()
  const goBack = () => navigate(-1)
  const { user } = useAuthStore()
  const {
    leaderboard,
    statistics,
    type,
    isLoading,
    error,
    fetchLeaderboard,
    fetchStatistics,
    setType,
    clearError
  } = useLeaderboardStore()
  
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all')
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchLeaderboard()
    fetchStatistics()
  }, [user, navigate, fetchLeaderboard, fetchStatistics])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400 bg-yellow-400/10'
      case 2: return 'text-gray-300 bg-gray-300/10'
      case 3: return 'text-orange-400 bg-orange-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatLastSolve = (lastSolve: string | null) => {
    if (!lastSolve) return 'Never'
    
    const date = new Date(lastSolve)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }
  
  // Prepare data for charts
  const topPlayersData = leaderboard.slice(0, 10).map((entry, index) => ({
    name: type === 'individual' ? entry.username || 'Unknown' : entry.name || 'Unknown Team',
    value: entry.score
  }))
  
  const categoryData = statistics?.categories?.map(cat => ({
    name: cat.category,
    value: cat._count.id,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`
  })) || []
  
  // Mock time series data for demonstration
  const timeSeriesData = [
    { time: 'Jan', score: 120 },
    { time: 'Feb', score: 250 },
    { time: 'Mar', score: 180 },
    { time: 'Apr', score: 300 },
    { time: 'May', score: 420 },
    { time: 'Jun', score: 380 },
  ]

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 header-horror">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={goBack} 
                className="px-2 py-1 rounded btn-blood flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3 horror-title">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <span>Graphical Leaderboard</span>
                </h1>
                <div className="mt-2 horror-divider"></div>
                <p className="text-gray-400 mt-1">
                  Visualize your performance and rankings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Your Rank</p>
                <p className="text-2xl font-bold text-red-400">
                  #{leaderboard.findIndex(entry => entry.id === user.id) + 1 || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Challenges</p>
                  <p className="text-2xl font-bold text-white">{statistics.totalChallenges}</p>
                </div>
                <Award className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Solves</p>
                  <p className="text-2xl font-bold text-white">{statistics.totalSolves}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Players</p>
                  <p className="text-2xl font-bold text-white">{statistics.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Leaderboard Type</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => setType('individual')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        type === 'individual'
                          ? 'bg-red-600 text-white horror-glow'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <User className="h-4 w-4 inline mr-1" />
                      Individual
                    </button>
                    <button
                      onClick={() => setType('team')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        type === 'team'
                          ? 'bg-red-600 text-white horror-glow'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Users className="h-4 w-4 inline mr-1" />
                      Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Controls */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-400" />
              Performance Analytics
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Chart:</span>
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 text-sm rounded ${
                      chartType === 'bar' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setChartType('pie')}
                    className={`px-3 py-1 text-sm rounded ${
                      chartType === 'pie' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Pie
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 text-sm rounded ${
                      chartType === 'line' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Time:</span>
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setTimeRange('all')}
                    className={`px-3 py-1 text-sm rounded ${
                      timeRange === 'all' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setTimeRange('month')}
                    className={`px-3 py-1 text-sm rounded ${
                      timeRange === 'month' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeRange('week')}
                    className={`px-3 py-1 text-sm rounded ${
                      timeRange === 'week' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-400" />
                Top {type === 'individual' ? 'Players' : 'Teams'}
              </h3>
              {topPlayersData.length > 0 ? (
                <BarChartComponent data={topPlayersData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Challenges by Category
              </h3>
              <div className="flex items-center justify-center">
                {categoryData.length > 0 ? (
                  <PieChartComponent data={categoryData} />
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((cat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    ></div>
                    <span className="text-sm text-gray-300">{cat.name}</span>
                    <span className="text-sm text-gray-500">({cat.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Score Progression
            </h3>
            <LineChartComponent data={timeSeriesData} />
            <div className="flex justify-center mt-2 space-x-4 text-sm text-gray-400">
              {timeSeriesData.map((point, index) => (
                <span key={index}>{point.time}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span>{type === 'individual' ? 'Individual' : 'Team'} Rankings</span>
            </h3>
            <button 
              onClick={() => { fetchLeaderboard(); fetchStatistics(); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          )}
          
          {!isLoading && (
            <>
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center">
                  <Trophy className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No participants yet</h3>
                  <p className="text-gray-500">Be the first to solve a challenge!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {type === 'individual' ? 'Player' : 'Team'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Solves
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Last Solve
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {leaderboard.map((entry, index) => (
                        <tr
                          key={entry.id}
                          className={`hover:bg-gray-700 transition-colors ${
                            entry.id === user.id ? 'bg-gray-700/50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankColor(index + 1)}`}>
                              {getRankIcon(index + 1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-white">
                                {type === 'individual' ? entry.username : entry.name}
                              </div>
                              {entry.id === user.id && (
                                <span className="ml-2 px-2 py-1 text-xs bg-cyan-600 text-white rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Trophy className="h-4 w-4 text-yellow-400" />
                              <span className="text-sm font-semibold text-white">{entry.score}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {entry.solves}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatLastSolve(entry.lastSolve)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default GraphicalLeaderboard