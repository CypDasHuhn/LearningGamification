package dev.gamification.backend.routes.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import dev.gamification.backend.db.Users
import dev.gamification.backend.db.dbQuery
import dev.gamification.backend.db.toUserRecord
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.auth.principal
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
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date

const val JwtAuthName = "auth-jwt"
private const val jwtIssuer = "dev.gamification.backend"
private const val jwtAudience = "gamification-api-users"
private const val jwtRealm = "gamification-api"
private const val jwtUserIdClaim = "userId"
private const val jwtUserNameClaim = "userName"
private const val defaultJwtSecret = "dev-only-secret-change-me"
private const val tokenTtlDays = 7L

fun Application.configureAuth() {
    val jwtSecret = environment.config.propertyOrNull("app.auth.jwt.secret")?.getString() ?: defaultJwtSecret
    val jwtAlgorithm = Algorithm.HMAC256(jwtSecret)
    val jwtVerifier = JWT.require(jwtAlgorithm).withIssuer(jwtIssuer).withAudience(jwtAudience).build()

    install(Authentication) {
        jwt(JwtAuthName) {
            realm = jwtRealm
            verifier(jwtVerifier)
            validate { credential ->
                val userId = credential.payload.getClaim(jwtUserIdClaim).asInt()
                val userName = credential.payload.getClaim(jwtUserNameClaim).asString()
                if (userId != null && !userName.isNullOrBlank()) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
            }
        }
    }

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

                val token = signJwtToken(jwtAlgorithm, newUserId, body.userName)

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

                val token = signJwtToken(jwtAlgorithm, user.id, user.userName)

                call.respond(
                    AuthResponse(
                        token = token,
                        userId = user.id,
                        userName = user.userName,
                    ),
                )
            }

            authenticate(JwtAuthName) {
                get("/me") {
                    val userId = call.userIdClaim()
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
}

fun ApplicationCall.userIdClaim(): Int? = principal<JWTPrincipal>()?.payload?.getClaim(jwtUserIdClaim)?.asInt()

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

private fun signJwtToken(algorithm: Algorithm, userId: Int, userName: String): String =
    JWT.create()
        .withIssuer(jwtIssuer)
        .withAudience(jwtAudience)
        .withClaim(jwtUserIdClaim, userId)
        .withClaim(jwtUserNameClaim, userName)
        .withExpiresAt(Date.from(Instant.now().plus(tokenTtlDays, ChronoUnit.DAYS)))
        .sign(algorithm)

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
