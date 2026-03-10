package dev.gamification.backend.routes.leaderboard

import kotlinx.serialization.Serializable

@Serializable
data class LeaderboardEntryResponse(
    val rank: Int,
    val userId: Int,
    val userName: String,
    val points: Int,
    val completedQuestions: Int,
    val lastCompletedAt: Long? = null,
    val currentUser: Boolean,
)
