package dev.gamification.backend.auth

import dev.gamification.backend.db.Users
import dev.gamification.backend.db.dbQuery
import dev.gamification.backend.db.toUserRecord
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.selectAll
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

private val activeSessions = ConcurrentHashMap<String, Int>()

fun Application.configureAuth() {
    routing {
        route("/auth") {
            post("/register") {
                val body = call.receive<AuthRequest>()
                validateAuthBody(body)?.let { validationError ->
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse(validationError))
                    return@post
                }

                val existingUser = dbQuery {
                    Users.selectAll()
                        .where { Users.userName eq body.userName }
                        .singleOrNull()
                }

                if (existingUser != null) {
                    call.respond(HttpStatusCode.Conflict, ErrorResponse("Username already exists"))
                    return@post
                }

                val newUserId = dbQuery {
                    Users.insertAndGetId {
                        it[userName] = body.userName
                        it[passwordHash] = hashPassword(body.password)
                        it[createdAt] = System.currentTimeMillis()
                    }.value
                }

                val token = UUID.randomUUID().toString()
                activeSessions[token] = newUserId

                call.respond(
                    HttpStatusCode.Created,
                    AuthResponse(
                        token = token,
                        userId = newUserId,
                        userName = body.userName,
                    ),
                )
            }

            post("/login") {
                val body = call.receive<AuthRequest>()
                validateAuthBody(body)?.let { validationError ->
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse(validationError))
                    return@post
                }

                val user = dbQuery {
                    Users.selectAll()
                        .where { Users.userName eq body.userName }
                        .singleOrNull()
                        ?.toUserRecord()
                }

                if (user == null || user.passwordHash != hashPassword(body.password)) {
                    call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid credentials"))
                    return@post
                }

                val token = UUID.randomUUID().toString()
                activeSessions[token] = user.id

                call.respond(
                    AuthResponse(
                        token = token,
                        userId = user.id,
                        userName = user.userName,
                    ),
                )
            }

            get("/me") {
                val token = bearerToken(call.request.headers[HttpHeaders.Authorization])
                if (token == null) {
                    call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Missing bearer token"))
                    return@get
                }

                val userId = activeSessions[token]
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
                    return@get
                }

                val userName = dbQuery {
                    Users.selectAll()
                        .where { Users.id eq userId }
                        .singleOrNull()
                        ?.get(Users.userName)
                }

                if (userName == null) {
                    call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid session"))
                    return@get
                }

                call.respond(UserResponse(userId = userId, userName = userName))
            }
        }
    }
}

private fun validateAuthBody(body: AuthRequest): String? {
    if (body.userName.isBlank()) return "Username is required"
    if (body.password.length < 8) return "Password must be at least 8 characters"
    return null
}

private fun hashPassword(password: String): String {
    val digest = MessageDigest.getInstance("SHA-256")
    val hash = digest.digest(password.toByteArray(StandardCharsets.UTF_8))
    return hash.joinToString("") { "%02x".format(it) }
}

private fun bearerToken(authorizationHeader: String?): String? {
    if (authorizationHeader.isNullOrBlank()) return null
    val prefix = "Bearer "
    if (!authorizationHeader.startsWith(prefix, ignoreCase = true)) return null
    return authorizationHeader.substring(prefix.length).trim().takeIf { it.isNotEmpty() }
}

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
