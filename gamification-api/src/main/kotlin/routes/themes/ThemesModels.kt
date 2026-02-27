package dev.gamification.backend.routes.themes

import kotlinx.serialization.Serializable

@Serializable
data class ThemeResponse(
    val themeId: Int,
    val name: String,
    val description: String?,
    val questionCount: Int,
)

@Serializable
data class ThemeQuestionSetResponse(
    val questionSetId: Int,
    val title: String,
    val teamId: Int,
    val questionCount: Int,
)
