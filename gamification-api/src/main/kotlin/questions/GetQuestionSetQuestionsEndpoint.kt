package dev.gamification.backend.questions

import dev.gamification.backend.auth.ErrorResponse
import dev.gamification.backend.auth.userIdClaim
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.registerGetQuestionSetQuestionsEndpoint() {
    get("/{questionSetId}/questions") {
        val userId = call.userIdClaim()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
            return@get
        }

        val questionSetId = call.parameters["questionSetId"]?.toIntOrNull()
        if (questionSetId == null) {
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("questionSetId must be an integer"))
            return@get
        }

        when (val result = getQuestionsForQuestionSet(userId, questionSetId)) {
            is QuestionSetQuestionsResult.Success -> call.respond(result.questions)
            QuestionSetQuestionsResult.QuestionSetNotFound -> {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Question set not found"))
            }
        }
    }
}
