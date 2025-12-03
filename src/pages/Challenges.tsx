// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../stores/challengeStore';
import { useAuthStore } from '../stores/authStore';
import { 
  Trophy, Filter, Search, Flag, Download, Lightbulb, CheckCircle,
  ArrowLeft, Sliders, X, Star, Clock, Hash, BarChart3
} from 'lucide-react';

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    challenges,
    categories,
    selectedCategory,
    selectedDifficulty,
    isLoading,
    error,
    fetchChallenges,
    fetchCategories,
    setCategory,
    setDifficulty,
    clearError
  } = useChallengeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPoints, setMinPoints] = useState('');
  const [maxPoints, setMaxPoints] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'title' | 'solves' | 'created'>('points');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSolved, setShowSolved] = useState<boolean | 'all'>('all');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchChallenges();
    fetchCategories();
  }, [user, navigate, fetchChallenges, fetchCategories]);

  useEffect(() => {
    fetchChallenges();
  }, [selectedCategory, selectedDifficulty, fetchChallenges]);

  const filteredChallenges = challenges.filter(challenge => {
    // Search term filter
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Points filter
    const points = challenge.points;
    const matchesPoints = (minPoints === '' || points >= parseInt(minPoints)) && 
                         (maxPoints === '' || points <= parseInt(maxPoints));
    
    // Solved filter
    const matchesSolved = showSolved === 'all' || 
                         (showSolved === true && challenge.solved) || 
                         (showSolved === false && !challenge.solved);
    
    return matchesSearch && matchesPoints && matchesSolved;
  });

  // Sort challenges
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'points':
        comparison = a.points - b.points;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'solves':
        comparison = (a._count?.solves || 0) - (b._count?.solves || 0);
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      case 'insane': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'web': return '🌐';
      case 'crypto': return '🔐';
      case 'reverse': return '🔍';
      case 'forensics': return '🔬';
      case 'pwn': return '💥';
      case 'stego': return '🖼️';
      case 'networking': return '🔌';
      case 'osint': return '🔎';
      case 'ml': return '🤖';
      case 'blockchain': return '⛓️';
      case 'mobile': return '📱';
      case 'hardware': return '🔧';
      case 'cloud': return '☁️';
      case 'programming': return '💻';
      case 'misc': return '📝';
      default: return '🎯';
    }
  };

  const handleChallengeClick = (challengeId: string) => {
    navigate(`/challenges/${challengeId}`);
  };

  const handleSubmitFlag = (challengeId: string) => {
    navigate(`/challenges/${challengeId}`);
  };

  const goBack = () => navigate(-1);
  
  const clearAllFilters = () => {
    setSearchTerm('');
    setMinPoints('');
    setMaxPoints('');
    setCategory('');
    setDifficulty('');
    setShowSolved('all');
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

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
              <h1 className="text-3xl font-bold text-white horror-title">Challenges</h1>
              <div className="mt-2 horror-divider"></div>
              <p className="text-gray-400 mt-1">
                Test your skills across {categories.length} categories
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Your Score</p>
                <p className="text-2xl font-bold text-red-400">{user?._count?.solves ? user._count.solves * 100 : 0}</p>
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
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent card-horror"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 rounded-lg text-white btn-blood transition-colors"
            >
              <Sliders className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Advanced Filters</h3>
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryIcon(category)} {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="insane">Insane</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Points Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPoints}
                      onChange={(e) => setMinPoints(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={showSolved === 'all' ? 'all' : showSolved ? 'solved' : 'unsolved'}
                    onChange={(e) => setShowSolved(e.target.value === 'all' ? 'all' : e.target.value === 'solved' ? true : false)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Challenges</option>
                    <option value="unsolved">Not Solved</option>
                    <option value="solved">Solved</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSortBy('points'); setSortOrder('desc'); }}
                    className={`px-3 py-1 rounded text-sm ${
                      sortBy === 'points' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Points {sortBy === 'points' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    onClick={() => { setSortBy('title'); setSortOrder('asc'); }}
                    className={`px-3 py-1 rounded text-sm ${
                      sortBy === 'title' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    onClick={() => { setSortBy('solves'); setSortOrder('desc'); }}
                    className={`px-3 py-1 rounded text-sm ${
                      sortBy === 'solves' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Solves {sortBy === 'solves' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    onClick={() => { setSortBy('created'); setSortOrder('desc'); }}
                    className={`px-3 py-1 rounded text-sm ${
                      sortBy === 'created' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Newest {sortBy === 'created' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory || selectedDifficulty || minPoints || maxPoints || showSolved !== 'all') && (
          <div className="mb-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/50 text-blue-300">
                Search: "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-2 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-900/50 text-green-300">
                Category: {selectedCategory}
                <button 
                  onClick={() => setCategory('')}
                  className="ml-2 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
            {selectedDifficulty && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-900/50 text-yellow-300">
                Difficulty: {selectedDifficulty}
                <button 
                  onClick={() => setDifficulty('')}
                  className="ml-2 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
            {minPoints && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900/50 text-purple-300">
                Min Points: {minPoints}
                <button 
                  onClick={() => setMinPoints('')}
                  className="ml-2 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
            {maxPoints && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900/50 text-purple-300">
                Max Points: {maxPoints}
                <button 
                  onClick={() => setMaxPoints('')}
                  className="ml-2 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
            {showSolved !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-900/50 text-cyan-300">
                Status: {showSolved ? 'Solved' : 'Not Solved'}
                <button 
                  onClick={() => setShowSolved('all')}
                  className="ml-2 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        )}

        {/* Challenges Grid */}
        {!isLoading && sortedChallenges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No challenges found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory || selectedDifficulty || minPoints || maxPoints
                ? 'Try adjusting your search or filter criteria'
                : 'No challenges available at the moment'
              }
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {!isLoading && sortedChallenges.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400">
                Showing {sortedChallenges.length} of {challenges.length} challenges
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedChallenges.map(challenge => (
                <div
                  key={challenge.id}
                  className={`card-horror border rounded-lg p-6 transition-all cursor-pointer horror-glow ${challenge.solved
                      ? 'border-green-500 shadow-lg shadow-green-500/20'
                      : 'border-gray-700'
                    }`}
                  onClick={() => handleChallengeClick(challenge.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-400">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {challenge.category}
                        </p>
                      </div>
                    </div>
                    {challenge.solved && (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    )}
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {challenge.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <div className="flex items-center space-x-2 text-red-400">
                      <Trophy className="h-4 w-4" />
                      <span className="font-semibold">{challenge.points}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      {challenge.files && challenge.files.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{challenge.files.length}</span>
                        </div>
                      )}
                      {challenge.hints && challenge.hints.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Lightbulb className="h-4 w-4" />
                          <span>{challenge.hints.length}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flag className="h-4 w-4" />
                      <span>{challenge._count?.solves || 0} solves</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                    </div>
                    {!challenge.solved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubmitFlag(challenge.id);
                        }}
                        className="px-3 py-1 text-white rounded font-medium transition-colors horror-glow btn-blood"
                      >
                        Submit Flag
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;