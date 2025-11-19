import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Eye, EyeOff, Edit } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface Challenge {
    id: string
    title: string
    description: string
    category: string
    difficulty: string
    points: number
    flag: string
    isVisible: boolean
    _count: {
        solves: number
    }
}

export default function AdminPanel() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'web',
        difficulty: 'easy',
        points: 100,
        flag: '',
        isVisible: true
    })

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard')
            return
        }
        fetchChallenges()
    }, [user, navigate])

    const fetchChallenges = async () => {
        try {
            const response = await api.get('/admin/challenges')
            setChallenges(response.data.challenges)
        } catch (error) {
            console.error('Error fetching challenges:', error)
            toast.error('Failed to load challenges')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingChallenge) {
                await api.patch(`/admin/challenges/${editingChallenge.id}`, formData)
                toast.success('Challenge updated successfully!')
            } else {
                await api.post('/admin/challenges', formData)
                toast.success('Challenge created successfully!')
            }

            setFormData({
                title: '',
                description: '',
                category: 'web',
                difficulty: 'easy',
                points: 100,
                flag: '',
                isVisible: true
            })
            setShowCreateForm(false)
            setEditingChallenge(null)
            fetchChallenges()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save challenge')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this challenge?')) return

        try {
            await api.delete(`/admin/challenges/${id}`)
            toast.success('Challenge deleted successfully!')
            fetchChallenges()
        } catch (error) {
            toast.error('Failed to delete challenge')
        }
    }

    const toggleVisibility = async (challenge: Challenge) => {
        try {
            await api.post(`/admin/challenges/${challenge.id}/toggle-visibility`)
            toast.success(`Challenge ${!challenge.isVisible ? 'shown' : 'hidden'}`)
            fetchChallenges()
        } catch (error) {
            toast.error('Failed to update visibility')
        }
    }

    const startEdit = (challenge: Challenge) => {
        setEditingChallenge(challenge)
        setFormData({
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
            difficulty: challenge.difficulty,
            points: challenge.points,
            flag: challenge.flag,
            isVisible: challenge.isVisible
        })
        setShowCreateForm(true)
    }

    const cancelForm = () => {
        setShowCreateForm(false)
        setEditingChallenge(null)
        setFormData({
            title: '',
            description: '',
            category: 'web',
            difficulty: 'easy',
            points: 100,
            flag: '',
            isVisible: true
        })
    }

    if (loading) {
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
                        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                        <p className="text-gray-400 mt-1">Create and manage CTF challenges</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Challenge
                    </button>
                </div>

                {showCreateForm && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="web">Web</option>
                                        <option value="crypto">Crypto</option>
                                        <option value="pwn">Pwn</option>
                                        <option value="reverse">Reverse</option>
                                        <option value="forensics">Forensics</option>
                                        <option value="misc">Misc</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
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
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
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
                                    value={formData.flag}
                                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                                    placeholder="CTF{example_flag}"
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isVisible"
                                    checked={formData.isVisible}
                                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
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
                                    onClick={cancelForm}
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
                                                            'bg-red-900 text-red-300'
                                                    }`}>
                                                    {challenge.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {challenge.points}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {challenge._count.solves}
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
                                                        onClick={() => toggleVisibility(challenge)}
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
                                                        onClick={() => startEdit(challenge)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(challenge.id)}
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
            </div>
        </div>
    )
}
