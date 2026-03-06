package dev.gamification.backend.routes.leaderboard

import dev.gamification.backend.db.Questions
import dev.gamification.backend.db.UserQuestionProgress
import dev.gamification.backend.db.Users
import dev.gamification.backend.db.dbQuery
import org.jetbrains.exposed.sql.innerJoin
import org.jetbrains.exposed.sql.selectAll

fun getLeaderboard(currentUserId: Int, limit: Int?): List<LeaderboardEntryResponse> =
    dbQuery {
        val users =
            Users.selectAll()
                .map { row ->
                    UserSnapshot(
                        userId = row[Users.id].value,
                        userName = row[Users.userName],
                    )
                }

        if (users.isEmpty()) {
            return@dbQuery emptyList()
        }

        val statsByUserId = mutableMapOf<Int, MutableUserStats>()
        (UserQuestionProgress innerJoin Questions)
            .selectAll()
            .forEach { row ->
                val userId = row[UserQuestionProgress.userId].value
                val stats = statsByUserId.getOrPut(userId) { MutableUserStats() }
                stats.points += row[Questions.points]
                stats.completedQuestions += 1

                val completedAt = row[UserQuestionProgress.completedAt]
                if (stats.lastCompletedAt == null || completedAt > stats.lastCompletedAt!!) {
                    stats.lastCompletedAt = completedAt
                }
            }

        val sorted =
            users
                .map { user ->
                    val stats = statsByUserId[user.userId]
                    LeaderboardEntryResponse(
                        rank = 0,
                        userId = user.userId,
                        userName = user.userName,
                        points = stats?.points ?: 0,
                        completedQuestions = stats?.completedQuestions ?: 0,
                        lastCompletedAt = stats?.lastCompletedAt,
                        currentUser = user.userId == currentUserId,
                    )
                }
                .sortedWith(
                    compareByDescending<LeaderboardEntryResponse> { it.points }
                        .thenByDescending { it.completedQuestions }
                        .thenByDescending { it.lastCompletedAt ?: Long.MIN_VALUE }
                        .thenBy { it.userName.lowercase() }
                        .thenBy { it.userId },
                )

        val ranked =
            sorted.mapIndexed { index, entry ->
                entry.copy(rank = index + 1)
            }

        if (limit == null) ranked else ranked.take(limit)
    }

private data class UserSnapshot(
    val userId: Int,
    val userName: String,
)

private data class MutableUserStats(
    var points: Int = 0,
    var completedQuestions: Int = 0,
    var lastCompletedAt: Long? = null,
)
