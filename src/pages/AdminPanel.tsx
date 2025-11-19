import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Eye, EyeOff, Edit, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import api, { Challenge } from '@/lib/api'

export default function AdminPanel() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [hints, setHints] = useState<Array<{ content: string; penalty: number }>>([])
    const [newHint, setNewHint] = useState({ content: '', penalty: 0 })

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
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingChallenge) {
                const response = await api.updateChallenge(editingChallenge.id, formData)
                if (response.success) {
                    toast.success('Challenge updated successfully!')
                } else {
                    toast.error(response.error || 'Failed to update challenge')
                    return
                }
            } else {
                const form = new FormData()
                form.append('title', formData.title)
                form.append('description', formData.description)
                form.append('category', formData.category)
                form.append('difficulty', formData.difficulty)
                form.append('points', formData.points.toString())
                form.append('flag', formData.flag)
                form.append('isVisible', formData.isVisible.toString())

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

            setFormData({
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

    const toggleVisibility = async (challenge: Challenge) => {
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

    const startEdit = (challenge: Challenge) => {
        setEditingChallenge(challenge)
        setSelectedFiles([]) // Clear files when editing
        setHints([]) // Clear hints when editing
        setNewHint({ content: '', penalty: 0 })
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
        setSelectedFiles([])
        setHints([])
        setNewHint({ content: '', penalty: 0 })
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
