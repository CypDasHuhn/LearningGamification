package dev.gamification.backend.routes.auth

import kotlinx.serialization.Serializable

@Serializable
data class AuthRequest(
    val userName: String,
    val password: String,
)

@Serializable
data class AuthResponse(
    val token: String,
    val userId: Int,
    val userName: String,
)

@Serializable
data class UserResponse(
    val userId: Int,
    val userName: String,
)

@Serializable
data class ErrorResponse(
    val message: String,
)