package dev.gamification.backend.themes

import dev.gamification.backend.auth.ErrorResponse
import dev.gamification.backend.auth.userIdClaim
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.registerGetThemeQuestionSetsEndpoint() {
    get("/{themeId}/question-sets") {
        val userId = call.userIdClaim()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
            return@get
        }

        val themeId = call.parameters["themeId"]?.toIntOrNull()
        if (themeId == null) {
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("themeId must be an integer"))
            return@get
        }

        when (val result = getThemeQuestionSets(themeId)) {
            is ThemeQuestionSetsResult.Success -> call.respond(result.questionSets)
            ThemeQuestionSetsResult.ThemeNotFound -> call.respond(HttpStatusCode.NotFound, ErrorResponse("Theme not found"))
        }
    }
}
