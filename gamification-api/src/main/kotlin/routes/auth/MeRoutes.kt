package dev.gamification.backend.routes.auth

import io.ktor.http.HttpStatusCode
import io.ktor.server.auth.authenticate
import io.ktor.server.response.*
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.meRoute() {
    authenticate(JwtAuthName) {
        get("/me") {
            val userId = call.userIdClaim()
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
                return@get
            }

            val userName = call.userNameFromDb()
            if (userName == null) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid session"))
                return@get
            }

            call.respond(UserResponse(userId = userId, userName = userName))
        }
    }
}