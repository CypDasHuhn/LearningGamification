package dev.gamification.backend.routes.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import dev.gamification.backend.db.Users
import dev.gamification.backend.db.dbQuery
import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
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
public const val jwtUserIdClaim = "userId"
const val jwtUserNameClaim = "userName"
const val defaultJwtSecret = "dev-only-secret-change-me"
private const val tokenTtlDays = 7L

fun hashPassword(password: String): String {
    val digest = MessageDigest.getInstance("SHA-256")
    val hash = digest.digest(password.toByteArray(StandardCharsets.UTF_8))
    return hash.joinToString("") { "%02x".format(it) }
}

fun signJwtToken(algorithm: Algorithm, userId: Int, userName: String): String =
    JWT.create()
        .withIssuer(jwtIssuer)
        .withAudience(jwtAudience)
        .withClaim(jwtUserIdClaim, userId)
        .withClaim(jwtUserNameClaim, userName)
        .withExpiresAt(Date.from(Instant.now().plus(tokenTtlDays, ChronoUnit.DAYS)))
        .sign(algorithm)

fun validateAuthBody(body: AuthRequest): String? {
    if (body.userName.isBlank()) return "Username is required"
    if (body.password.length < 8) return "Password must be at least 8 characters"
    return null
}

suspend fun ApplicationCall.userIdClaim(): Int? =
    principal<JWTPrincipal>()?.payload?.getClaim(jwtUserIdClaim)?.asInt()

suspend fun ApplicationCall.userNameFromDb(): String? =
    userIdClaim()?.let { id ->
        dbQuery {
            Users.selectAll()
                .where { Users.id eq id }
                .singleOrNull()
                ?.get(Users.userName)
        }
    }