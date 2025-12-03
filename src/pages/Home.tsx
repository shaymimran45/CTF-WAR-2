import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  Shield, Trophy, Users, BarChart, Target, Calendar,
  ArrowRight, User, LogIn, UserPlus
} from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // If user is logged in, don't show the home page content
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-16 w-16 text-red-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              <span className="block">Welcome to</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 mt-3">
                CTF Platform
              </span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-400">
              Test your cybersecurity skills in our Capture The Flag challenges. 
              Solve puzzles, hack systems, and climb the leaderboard.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link 
                to="/login" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Sign In
                <LogIn className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center px-6 py-3 border border-gray-700 text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Register
                <UserPlus className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Why Join Our CTF Platform?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">
              Everything you need to learn and compete in cybersecurity challenges
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                <Target className="h-6 w-6" />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white">Diverse Challenges</h3>
                <p className="mt-2 text-base text-gray-400">
                  From web exploitation to cryptography, reverse engineering to forensics - we have challenges for every skill level.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white">Competitive Leaderboard</h3>
                <p className="mt-2 text-base text-gray-400">
                  Climb the ranks and compete with other cybersecurity enthusiasts from around the world.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white">Team Collaboration</h3>
                <p className="mt-2 text-base text-gray-400">
                  Form teams, collaborate on challenges, and participate in team-based competitions.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                <BarChart className="h-6 w-6" />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white">Performance Analytics</h3>
                <p className="mt-2 text-base text-gray-400">
                  Track your progress, identify strengths and weaknesses, and improve your skills over time.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white">Regular Contests</h3>
                <p className="mt-2 text-base text-gray-400">
                  Participate in scheduled contests with themed challenges and special rewards.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                <User className="h-6 w-6" />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white">Skill Development</h3>
                <p className="mt-2 text-base text-gray-400">
                  Learn new techniques, practice existing skills, and stay updated with the latest security trends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-red-600">Join our community today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}