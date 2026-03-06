package dev.gamification.backend.routes.auth

import com.auth0.jwt.algorithms.Algorithm
import dev.gamification.backend.db.Users
import dev.gamification.backend.db.dbQuery
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.selectAll

fun Route.registerRoute(jwtAlgorithm: Algorithm) {
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
            AuthResponse(token = token, userId = newUserId, userName = body.userName)
        )
    }
}