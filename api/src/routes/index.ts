import express from 'express'
import { register, login, getProfile } from '../controllers/authController'
import { getChallenges, getChallenge, submitFlag, getCategories, createChallenge, deleteChallenge, deleteAllChallenges, downloadFile, getAllChallengesAdmin, updateChallenge, toggleVisibility, setAllVisibility, addHint, updateHint, deleteHint, addFilesToChallenge, deleteChallengeFile, createCompetition } from '../controllers/challengeController'
import { getLeaderboard, getStatistics, createTeam, joinTeam, leaveTeam, getMyTeam, kickMember } from '../controllers/leaderboardController'
import { authenticateToken, requireRole } from '../lib/auth'
import multer from 'multer'

const router = express.Router()

// Use memory storage for Supabase uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})

// Auth routes
router.post('/auth/register', register)
router.post('/auth/login', login)
router.get('/auth/profile', authenticateToken, getProfile)

// Challenge routes
router.get('/challenges', authenticateToken, getChallenges)
router.get('/challenges/categories', getCategories)
router.get('/challenges/:id', authenticateToken, getChallenge)
router.post('/challenges/:id/submit', authenticateToken, submitFlag)

// Admin routes
router.post('/admin/challenges', authenticateToken, requireRole(['admin']), upload.array('files'), createChallenge)
router.delete('/admin/challenges/:id', authenticateToken, requireRole(['admin']), deleteChallenge)
router.delete('/admin/challenges', authenticateToken, requireRole(['admin']), deleteAllChallenges)
router.get('/admin/challenges', authenticateToken, requireRole(['admin']), getAllChallengesAdmin)
router.patch('/admin/challenges/:id', authenticateToken, requireRole(['admin']), updateChallenge)
router.post('/admin/challenges/:id/toggle-visibility', authenticateToken, requireRole(['admin']), toggleVisibility)
router.post('/admin/challenges/visibility', authenticateToken, requireRole(['admin']), setAllVisibility)
router.post('/admin/challenges/:id/hints', authenticateToken, requireRole(['admin']), addHint)
router.patch('/admin/hints/:hintId', authenticateToken, requireRole(['admin']), updateHint)
router.delete('/admin/hints/:hintId', authenticateToken, requireRole(['admin']), deleteHint)
router.post('/admin/challenges/:id/files', authenticateToken, requireRole(['admin']), upload.array('files'), addFilesToChallenge)
router.delete('/admin/files/:fileId', authenticateToken, requireRole(['admin']), deleteChallengeFile)
router.post('/admin/competitions', authenticateToken, requireRole(['admin']), createCompetition)

// File download
router.get('/files/:id', downloadFile)

// Leaderboard routes
router.get('/leaderboard', getLeaderboard)
router.get('/statistics', getStatistics)
router.post('/teams', authenticateToken, createTeam)
router.post('/teams/join', authenticateToken, joinTeam)
router.post('/teams/leave', authenticateToken, leaveTeam)
router.get('/teams/me', authenticateToken, getMyTeam)
router.post('/teams/kick', authenticateToken, kickMember)

export default router