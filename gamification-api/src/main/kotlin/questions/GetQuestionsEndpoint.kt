package dev.gamification.backend.questions

import dev.gamification.backend.auth.ErrorResponse
import dev.gamification.backend.auth.userIdClaim
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.registerGetQuestionsEndpoint() {
    get {
        val userId = call.userIdClaim()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
            return@get
        }

        val questionSetIdRaw = call.request.queryParameters["questionSetId"]
        val questionSetId = questionSetIdRaw?.toIntOrNull()
        if (questionSetIdRaw != null && questionSetId == null) {
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("questionSetId must be an integer"))
            return@get
        }

        call.respond(getQuestionsForUser(userId, questionSetId))
    }
}
