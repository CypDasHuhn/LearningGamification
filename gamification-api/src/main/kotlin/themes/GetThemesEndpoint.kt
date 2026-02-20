package dev.gamification.backend.themes

import dev.gamification.backend.auth.ErrorResponse
import dev.gamification.backend.auth.userIdClaim
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.registerGetThemesEndpoint() {
    get {
        val userId = call.userIdClaim()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
            return@get
        }

        call.respond(getAllThemes())
    }
}
