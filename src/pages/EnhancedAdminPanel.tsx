import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Trash2, Eye, EyeOff, Edit, Upload, X, ExternalLink, 
  Calendar, Users, Trophy, Tag, Play, Pause, CheckCircle, 
  Clock, BarChart3, Award
} from 'lucide-react'
import { toast } from 'sonner'
import api, { Challenge, Contest, ContestCategory } from '@/lib/api'

export default function EnhancedAdminPanel() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    
    // States for challenges
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [loadingChallenges, setLoadingChallenges] = useState(true)
    const [showCreateChallengeForm, setShowCreateChallengeForm] = useState(false)
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [hints, setHints] = useState<Array<{ content: string; penalty: number }>>([])
    const [newHint, setNewHint] = useState({ content: '', penalty: 0 })
    
    // States for contests
    const [contests, setContests] = useState<Contest[]>([])
    const [loadingContests, setLoadingContests] = useState(true)
    const [showCreateContestForm, setShowCreateContestForm] = useState(false)
    const [editingContest, setEditingContest] = useState<Contest | null>(null)
    const [contestCategories, setContestCategories] = useState<ContestCategory[]>([])
    
    // States for contest challenges
    const [contestChallenges, setContestChallenges] = useState<Challenge[]>([])
    const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([])
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
    
    const [activeTab, setActiveTab] = useState<'challenges' | 'contests'>('challenges')
    
    const [challengeFormData, setChallengeFormData] = useState({
        title: '',
        description: '',
        category: 'web',
        difficulty: 'easy',
        points: 100,
        flag: '',
        isVisible: true
    })
    
    const [contestFormData, setContestFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        startTime: '',
        endTime: '',
        registrationDeadline: '',
        maxParticipants: 0,
        minParticipants: 1,
        isPublic: true,
        isFeatured: false,
        status: 'draft'
    })

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard')
            return
        }
        fetchChallenges()
        fetchContestCategories()
    }, [user, navigate])

    const fetchChallenges = async () => {
        try {
            const response = await api.getAdminChallenges()
            if (response.success && response.data) {
                setChallenges(response.data.challenges)
            } else {
                toast.error(response.error || 'Failed to load challenges')
            }
        } catch (error) {
            console.error('Error fetching challenges:', error)
            toast.error('Failed to load challenges')
        } finally {
            setLoadingChallenges(false)
        }
    }
    
    const fetchContests = async () => {
        try {
            const response = await api.getContests()
            if (response.success && response.data) {
                setContests(response.data.contests)
            } else {
                toast.error(response.error || 'Failed to load contests')
            }
        } catch (error) {
            console.error('Error fetching contests:', error)
            toast.error('Failed to load contests')
        } finally {
            setLoadingContests(false)
        }
    }
    
    const fetchContestCategories = async () => {
        try {
            const response = await api.getContestCategories()
            if (response.success && response.data) {
                setContestCategories(response.data.categories)
            }
        } catch (error) {
            console.error('Error fetching contest categories:', error)
        }
    }
    
    const fetchContestDetails = async (contestId: string) => {
        try {
            const response = await api.getContest(contestId)
            if (response.success && response.data) {
                setSelectedContest(response.data)
                setContestChallenges(response.data.challenges)
                
                // Get challenges not in this contest
                const contestChallengeIds = response.data.challenges.map(c => c.id)
                const remainingChallenges = challenges.filter(c => !contestChallengeIds.includes(c.id))
                setAvailableChallenges(remainingChallenges)
            }
        } catch (error) {
            console.error('Error fetching contest details:', error)
            toast.error('Failed to load contest details')
        }
    }

    const handleChallengeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingChallenge) {
                const response = await api.updateChallenge(editingChallenge.id, challengeFormData)
                if (response.success) {
                    toast.success('Challenge updated successfully!')
                } else {
                    toast.error(response.error || 'Failed to update challenge')
                    return
                }
            } else {
                const form = new FormData()
                form.append('title', challengeFormData.title)
                form.append('description', challengeFormData.description)
                form.append('category', challengeFormData.category)
                form.append('difficulty', challengeFormData.difficulty)
                form.append('points', challengeFormData.points.toString())
                form.append('flag', challengeFormData.flag)
                form.append('isVisible', challengeFormData.isVisible.toString())

                // Add files if any
                selectedFiles.forEach((file) => {
                    form.append('files', file)
                })

                const response = await api.createChallenge(form)
                if (response.success) {
                    // Add hints if any
                    if (hints.length > 0 && response.data?.challenge?.id) {
                        for (const hint of hints) {
                            await api.addHint(response.data.challenge.id, hint.content, hint.penalty)
                        }
                    }
                    toast.success('Challenge created successfully!')
                } else {
                    toast.error(response.error || 'Failed to create challenge')
                    return
                }
            }

            setChallengeFormData({
                title: '',
                description: '',
                category: 'web',
                difficulty: 'easy',
                points: 100,
                flag: '',
                isVisible: true
            })
            setSelectedFiles([])
            setHints([])
            setNewHint({ content: '', penalty: 0 })
            setShowCreateChallengeForm(false)
            setEditingChallenge(null)
            fetchChallenges()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save challenge')
        }
    }
    
    const handleContestSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const payload = {
                ...contestFormData,
                maxParticipants: parseInt(contestFormData.maxParticipants.toString()),
                minParticipants: parseInt(contestFormData.minParticipants.toString())
            }
            
            if (editingContest) {
                const response = await api.updateContest(editingContest.id, payload)
                if (response.success) {
                    toast.success('Contest updated successfully!')
                } else {
                    toast.error(response.error || 'Failed to update contest')
                    return
                }
            } else {
                const response = await api.createContest(payload)
                if (response.success) {
                    toast.success('Contest created successfully!')
                } else {
                    toast.error(response.error || 'Failed to create contest')
                    return
                }
            }

            setContestFormData({
                name: '',
                description: '',
                categoryId: '',
                startTime: '',
                endTime: '',
                registrationDeadline: '',
                maxParticipants: 0,
                minParticipants: 1,
                isPublic: true,
                isFeatured: false,
                status: 'draft'
            })
            setShowCreateContestForm(false)
            setEditingContest(null)
            fetchContests()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save contest')
        }
    }

    const handleDeleteChallenge = async (id: string) => {
        if (!confirm('Are you sure you want to delete this challenge?')) return

        try {
            const response = await api.deleteAdminChallenge(id)
            if (response.success) {
                toast.success('Challenge deleted successfully!')
                fetchChallenges()
            } else {
                toast.error(response.error || 'Failed to delete challenge')
            }
        } catch (error) {
            toast.error('Failed to delete challenge')
        }
    }
    
    const handleDeleteContest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contest? This will remove all associated data.')) return

        try {
            const response = await api.deleteContest(id)
            if (response.success) {
                toast.success('Contest deleted successfully!')
                fetchContests()
            } else {
                toast.error(response.error || 'Failed to delete contest')
            }
        } catch (error) {
            toast.error('Failed to delete contest')
        }
    }

    const toggleChallengeVisibility = async (challenge: Challenge) => {
        try {
            const response = await api.toggleChallengeVisibility(challenge.id)
            if (response.success) {
                toast.success(`Challenge ${!challenge.isVisible ? 'shown' : 'hidden'}`)
                fetchChallenges()
            } else {
                toast.error(response.error || 'Failed to update visibility')
            }
        } catch (error) {
            toast.error('Failed to update visibility')
        }
    }
    
    const toggleContestStatus = async (contest: Contest) => {
        try {
            const newStatus = contest.status === 'active' ? 'paused' : 'active'
            const response = await api.updateContest(contest.id, { status: newStatus })
            if (response.success) {
                toast.success(`Contest ${newStatus === 'active' ? 'activated' : 'paused'}`)
                fetchContests()
            } else {
                toast.error(response.error || 'Failed to update contest status')
            }
        } catch (error) {
            toast.error('Failed to update contest status')
        }
    }

    const startEditChallenge = (challenge: Challenge) => {
        setEditingChallenge(challenge)
        setSelectedFiles([])
        setHints([])
        setNewHint({ content: '', penalty: 0 })
        setChallengeFormData({
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
            difficulty: challenge.difficulty,
            points: challenge.points,
            flag: challenge.flag,
            isVisible: challenge.isVisible
        })
        setShowCreateChallengeForm(true)
    }
    
    const startEditContest = (contest: Contest) => {
        setEditingContest(contest)
        setContestFormData({
            name: contest.name,
            description: contest.description || '',
            categoryId: contest.categoryId || '',
            startTime: contest.startTime,
            endTime: contest.endTime,
            registrationDeadline: contest.registrationDeadline || '',
            maxParticipants: contest.maxParticipants,
            minParticipants: contest.minParticipants,
            isPublic: contest.isPublic,
            isFeatured: contest.isFeatured,
            status: contest.status
        })
        setShowCreateContestForm(true)
    }

    const cancelChallengeForm = () => {
        setShowCreateChallengeForm(false)
        setEditingChallenge(null)
        setSelectedFiles([])
        setHints([])
        setNewHint({ content: '', penalty: 0 })
        setChallengeFormData({
            title: '',
            description: '',
            category: 'web',
            difficulty: 'easy',
            points: 100,
            flag: '',
            isVisible: true
        })
    }
    
    const cancelContestForm = () => {
        setShowCreateContestForm(false)
        setEditingContest(null)
        setContestFormData({
            name: '',
            description: '',
            categoryId: '',
            startTime: '',
            endTime: '',
            registrationDeadline: '',
            maxParticipants: 0,
            minParticipants: 1,
            isPublic: true,
            isFeatured: false,
            status: 'draft'
        })
    }
    
    const addChallengeToContest = async (challengeId: string) => {
        if (!selectedContest) return
        
        try {
            const response = await api.addChallengeToContest(selectedContest.id, challengeId)
            if (response.success) {
                toast.success('Challenge added to contest!')
                fetchContestDetails(selectedContest.id)
                fetchContests()
            } else {
                toast.error(response.error || 'Failed to add challenge to contest')
            }
        } catch (error) {
            toast.error('Failed to add challenge to contest')
        }
    }
    
    const removeChallengeFromContest = async (challengeId: string) => {
        if (!selectedContest) return
        
        try {
            const response = await api.removeChallengeFromContest(selectedContest.id, challengeId)
            if (response.success) {
                toast.success('Challenge removed from contest!')
                fetchContestDetails(selectedContest.id)
                fetchContests()
            } else {
                toast.error(response.error || 'Failed to remove challenge from contest')
            }
        } catch (error) {
            toast.error('Failed to remove challenge from contest')
        }
    }
    
    const viewContestDetails = (contest: Contest) => {
        setSelectedContest(contest)
        fetchContestDetails(contest.id)
    }
    
    const backToContestList = () => {
        setSelectedContest(null)
        setContestChallenges([])
        setAvailableChallenges([])
    }

    if (loadingChallenges && loadingContests) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Enhanced Admin Panel</h1>
                        <p className="text-gray-400 mt-1">Manage challenges and contests</p>
                    </div>
                    
                    <div className="flex gap-3">
                        {activeTab === 'challenges' && (
                            <button
                                onClick={() => setShowCreateChallengeForm(!showCreateChallengeForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                New Challenge
                            </button>
                        )}
                        
                        {activeTab === 'contests' && !selectedContest && (
                            <button
                                onClick={() => setShowCreateContestForm(!showCreateContestForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                New Contest
                            </button>
                        )}
                        
                        {selectedContest && (
                            <button
                                onClick={backToContestList}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                                Back to Contests
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="mb-8 border-b border-gray-700">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('challenges')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'challenges'
                                    ? 'border-red-500 text-red-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            Challenges
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('contests')
                                fetchContests()
                            }}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'contests'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            Contests
                        </button>
                    </nav>
                </div>
                
                {/* Challenges Tab */}
                {activeTab === 'challenges' && (
                    <>
                        {showCreateChallengeForm && (
                            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                                <h2 className="text-xl font-bold text-white mb-4">
                                    {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
                                </h2>
                                <form onSubmit={handleChallengeSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={challengeFormData.title}
                                            onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={challengeFormData.description}
                                            onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={challengeFormData.category}
                                                onChange={(e) => setChallengeFormData({ ...challengeFormData, category: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <option value="web">Web Exploitation</option>
                                                <option value="crypto">Cryptography</option>
                                                <option value="pwn">Binary Exploitation (Pwn)</option>
                                                <option value="reverse">Reverse Engineering</option>
                                                <option value="forensics">Forensics</option>
                                                <option value="stego">Steganography</option>
                                                <option value="networking">Networking</option>
                                                <option value="osint">OSINT</option>
                                                <option value="ml">Machine Learning / AI</option>
                                                <option value="blockchain">Blockchain / Smart Contracts</option>
                                                <option value="mobile">Mobile Security</option>
                                                <option value="hardware">Hardware / IoT</option>
                                                <option value="cloud">Cloud Security</option>
                                                <option value="programming">Programming / Scripting</option>
                                                <option value="misc">Miscellaneous</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Difficulty
                                            </label>
                                            <select
                                                value={challengeFormData.difficulty}
                                                onChange={(e) => setChallengeFormData({ ...challengeFormData, difficulty: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                                <option value="insane">Insane</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Points
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={challengeFormData.points}
                                                onChange={(e) => setChallengeFormData({ ...challengeFormData, points: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Flag
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={challengeFormData.flag}
                                            onChange={(e) => setChallengeFormData({ ...challengeFormData, flag: e.target.value })}
                                            placeholder="WoW{example_flag}"
                                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Challenge Files (Optional)
                                        </label>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-700 text-gray-300 rounded-lg border-2 border-dashed border-gray-600 hover:border-red-500 hover:bg-gray-600 cursor-pointer transition-colors">
                                                <Upload className="w-5 h-5 mr-2" />
                                                <span>Click to upload files</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)])
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            {selectedFiles.length > 0 && (
                                                <div className="space-y-2">
                                                    {selectedFiles.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between px-3 py-2 bg-gray-700 rounded-lg">
                                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                                <span className="font-medium">{file.name}</span>
                                                                <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Hints (Optional)
                                        </label>
                                        <div className="space-y-3">
                                            {hints.length > 0 && (
                                                <div className="space-y-2">
                                                    {hints.map((hint, index) => (
                                                        <div key={index} className="flex items-start justify-between px-3 py-2 bg-gray-700 rounded-lg">
                                                            <div className="flex-1">
                                                                <p className="text-sm text-white">{hint.content}</p>
                                                                <p className="text-xs text-gray-400 mt-1">Penalty: -{hint.penalty} points</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setHints(hints.filter((_, i) => i !== index))}
                                                                className="text-red-400 hover:text-red-300 transition-colors ml-2"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newHint.content}
                                                    onChange={(e) => setNewHint({ ...newHint, content: e.target.value })}
                                                    placeholder="Hint text..."
                                                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                                <input
                                                    type="number"
                                                    value={newHint.penalty}
                                                    onChange={(e) => setNewHint({ ...newHint, penalty: parseInt(e.target.value) || 0 })}
                                                    placeholder="Penalty"
                                                    min="0"
                                                    className="w-24 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newHint.content) {
                                                            setHints([...hints, newHint])
                                                            setNewHint({ content: '', penalty: 0 })
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                >
                                                    Add Hint
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isVisible"
                                            checked={challengeFormData.isVisible}
                                            onChange={(e) => setChallengeFormData({ ...challengeFormData, isVisible: e.target.checked })}
                                            className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                                        />
                                        <label htmlFor="isVisible" className="text-sm text-gray-300">
                                            Make challenge visible to participants
                                        </label>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelChallengeForm}
                                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="bg-gray-800 rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-700">
                                <h2 className="text-lg font-semibold text-white">All Challenges</h2>
                            </div>

                            {challenges.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    No challenges yet. Create your first challenge!
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Difficulty
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Points
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Solves
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Files
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                                            {challenges.map((challenge) => (
                                                <tr key={challenge.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                        {challenge.title}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                                                            {challenge.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        <span className={`px-2 py-1 rounded text-xs ${challenge.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
                                                            challenge.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                                                            challenge.difficulty === 'hard' ? 'bg-red-900 text-red-300' :
                                                            'bg-purple-900 text-purple-300'
                                                        }`}>
                                                            {challenge.difficulty}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {challenge.points}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {challenge._count?.solves || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {challenge.files?.length || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {challenge.isVisible ? (
                                                            <span className="text-green-400">Visible</span>
                                                        ) : (
                                                            <span className="text-gray-500">Hidden</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/challenges/${challenge.id}`)}
                                                                className="text-green-400 hover:text-green-300 transition-colors"
                                                                title="View Challenge"
                                                            >
                                                                <ExternalLink className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleChallengeVisibility(challenge)}
                                                                className="text-gray-400 hover:text-white transition-colors"
                                                                title={challenge.isVisible ? 'Hide' : 'Show'}
                                                            >
                                                                {challenge.isVisible ? (
                                                                    <Eye className="w-5 h-5" />
                                                                ) : (
                                                                    <EyeOff className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => startEditChallenge(challenge)}
                                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteChallenge(challenge.id)}
                                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
                
                {/* Contests Tab */}
                {activeTab === 'contests' && (
                    <>
                        {selectedContest ? (
                            // Contest Details View
                            <div className="space-y-6">
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold text-white">{selectedContest.name}</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleContestStatus(selectedContest)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                                    selectedContest.status === 'active' 
                                                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                            >
                                                {selectedContest.status === 'active' ? (
                                                    <>
                                                        <Pause className="w-4 h-4" />
                                                        Pause
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => startEditContest(selectedContest)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-gray-300 mb-2">
                                                <Calendar className="w-5 h-5" />
                                                <span className="text-sm">Duration</span>
                                            </div>
                                            <p className="text-white">
                                                {new Date(selectedContest.startTime).toLocaleDateString()} - {new Date(selectedContest.endTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-gray-300 mb-2">
                                                <Users className="w-5 h-5" />
                                                <span className="text-sm">Participants</span>
                                            </div>
                                            <p className="text-white">
                                                {selectedContest._count?.participants || 0} registered
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-gray-300 mb-2">
                                                <Trophy className="w-5 h-5" />
                                                <span className="text-sm">Challenges</span>
                                            </div>
                                            <p className="text-white">
                                                {selectedContest._count?.challenges || 0} challenges
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-gray-300">{selectedContest.description || 'No description provided.'}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Contest Challenges */}
                                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-700">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Trophy className="w-5 h-5" />
                                                Contest Challenges ({contestChallenges.length})
                                            </h3>
                                        </div>
                                        
                                        {contestChallenges.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400">
                                                No challenges assigned to this contest yet.
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-700">
                                                {contestChallenges.map((challenge) => (
                                                    <div key={challenge.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-medium text-white">{challenge.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                                                                        {challenge.category}
                                                                    </span>
                                                                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                                                                        {challenge.points} pts
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => removeChallengeFromContest(challenge.id)}
                                                                className="text-red-400 hover:text-red-300 transition-colors p-2"
                                                                title="Remove from contest"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Available Challenges */}
                                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-700">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Plus className="w-5 h-5" />
                                                Available Challenges ({availableChallenges.length})
                                            </h3>
                                        </div>
                                        
                                        {availableChallenges.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400">
                                                All challenges are already assigned to this contest.
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-700">
                                                {availableChallenges.map((challenge) => (
                                                    <div key={challenge.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-medium text-white">{challenge.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                                                                        {challenge.category}
                                                                    </span>
                                                                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                                                                        {challenge.points} pts
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => addChallengeToContest(challenge.id)}
                                                                className="text-green-400 hover:text-green-300 transition-colors p-2"
                                                                title="Add to contest"
                                                            >
                                                                <Plus className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Contest List View
                            <>
                                {showCreateContestForm && (
                                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                                        <h2 className="text-xl font-bold text-white mb-4">
                                            {editingContest ? 'Edit Contest' : 'Create New Contest'}
                                        </h2>
                                        <form onSubmit={handleContestSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Contest Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={contestFormData.name}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, name: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Category
                                                    </label>
                                                    <select
                                                        value={contestFormData.categoryId}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, categoryId: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select a category</option>
                                                        {contestCategories.map(category => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={contestFormData.description}
                                                    onChange={(e) => setContestFormData({ ...contestFormData, description: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Start Time
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        required
                                                        value={contestFormData.startTime}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, startTime: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        End Time
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        required
                                                        value={contestFormData.endTime}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, endTime: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Max Participants (0 = unlimited)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={contestFormData.maxParticipants}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, maxParticipants: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Min Participants
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={contestFormData.minParticipants}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, minParticipants: parseInt(e.target.value) || 1 })}
                                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Registration Deadline
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={contestFormData.registrationDeadline}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, registrationDeadline: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="isPublic"
                                                        checked={contestFormData.isPublic}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, isPublic: e.target.checked })}
                                                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor="isPublic" className="text-sm text-gray-300">
                                                        Public Contest
                                                    </label>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="isFeatured"
                                                        checked={contestFormData.isFeatured}
                                                        onChange={(e) => setContestFormData({ ...contestFormData, isFeatured: e.target.checked })}
                                                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor="isFeatured" className="text-sm text-gray-300">
                                                        Featured Contest
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                >
                                                    {editingContest ? 'Update Contest' : 'Create Contest'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelContestForm}
                                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                
                                <div className="bg-gray-800 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-700">
                                        <h2 className="text-lg font-semibold text-white">All Contests</h2>
                                    </div>
                                    
                                    {contests.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">
                                            No contests yet. Create your first contest!
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-700">
                                                <thead className="bg-gray-900">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                            Category
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                            Duration
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                            Participants
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                            Challenges
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                                    {contests.map((contest) => (
                                                        <tr key={contest.id} className="hover:bg-gray-700/50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-white">{contest.name}</div>
                                                                <div className="text-sm text-gray-400 truncate max-w-xs">
                                                                    {contest.description || 'No description'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {contest.category ? (
                                                                    <span 
                                                                        className="px-2 py-1 rounded text-xs text-white" 
                                                                        style={{ backgroundColor: contest.category.color }}
                                                                    >
                                                                        {contest.category.name}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 text-sm">Uncategorized</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {new Date(contest.startTime).toLocaleDateString()}
                                                                </div>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {new Date(contest.endTime).toLocaleDateString()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="w-4 h-4" />
                                                                    {contest._count?.participants || 0}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                <div className="flex items-center gap-1">
                                                                    <Trophy className="w-4 h-4" />
                                                                    {contest._count?.challenges || 0}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 rounded text-xs ${
                                                                    contest.status === 'active' ? 'bg-green-900 text-green-300' :
                                                                    contest.status === 'draft' ? 'bg-gray-700 text-gray-300' :
                                                                    contest.status === 'finished' ? 'bg-blue-900 text-blue-300' :
                                                                    'bg-yellow-900 text-yellow-300'
                                                                }`}>
                                                                    {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => viewContestDetails(contest)}
                                                                        className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                                                        title="View Details"
                                                                    >
                                                                        <ExternalLink className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => toggleContestStatus(contest)}
                                                                        className={`${
                                                                            contest.status === 'active' 
                                                                                ? 'text-yellow-400 hover:text-yellow-300' 
                                                                                : 'text-green-400 hover:text-green-300'
                                                                        } transition-colors p-1`}
                                                                        title={contest.status === 'active' ? 'Pause' : 'Activate'}
                                                                    >
                                                                        {contest.status === 'active' ? (
                                                                            <Pause className="w-5 h-5" />
                                                                        ) : (
                                                                            <Play className="w-5 h-5" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => startEditContest(contest)}
                                                                        className="text-gray-400 hover:text-white transition-colors p-1"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteContest(contest.id)}
                                                                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}