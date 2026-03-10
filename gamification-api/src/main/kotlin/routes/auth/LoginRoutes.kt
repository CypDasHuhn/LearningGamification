package dev.gamification.backend.routes.auth

import com.auth0.jwt.algorithms.Algorithm
import dev.gamification.backend.db.Users
import dev.gamification.backend.db.dbQuery
import dev.gamification.backend.db.toUserRecord
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import org.jetbrains.exposed.sql.selectAll

fun Route.loginRoute(jwtAlgorithm: Algorithm) {
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

        call.respond(AuthResponse(token = token, userId = user.id, userName = user.userName))
    }
}