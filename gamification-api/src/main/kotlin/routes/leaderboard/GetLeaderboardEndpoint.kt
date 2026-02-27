package dev.gamification.backend.routes.leaderboard

import dev.gamification.backend.routes.auth.ErrorResponse
import dev.gamification.backend.routes.auth.userIdClaim
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.registerGetLeaderboardEndpoint() {
    get {
        val userId = call.userIdClaim()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
            return@get
        }

        val limitRaw = call.request.queryParameters["limit"]
        val limit =
            when {
                limitRaw == null -> null
                limitRaw.toIntOrNull() == null -> {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("limit must be an integer"))
                    return@get
                }
                limitRaw.toInt() <= 0 -> {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("limit must be greater than 0"))
                    return@get
                }
                else -> limitRaw.toInt()
            }

        call.respond(getLeaderboard(userId, limit))
    }
}
