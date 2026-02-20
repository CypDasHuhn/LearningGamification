package dev.gamification.backend.categories

import kotlinx.serialization.Serializable

@Serializable
data class CategoryResponse(
    val categoryId: Int,
    val name: String,
    val description: String?,
    val questionCount: Int,
)
