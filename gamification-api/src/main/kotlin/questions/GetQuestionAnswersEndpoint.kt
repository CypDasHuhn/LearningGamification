package dev.gamification.backend.questions

import dev.gamification.backend.auth.ErrorResponse
import dev.gamification.backend.auth.userIdClaim
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.registerGetQuestionAnswersEndpoint() {
    get("/{questionId}/answers") {
        val userId = call.userIdClaim()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
            return@get
        }

        val questionId = call.parameters["questionId"]?.toIntOrNull()
        if (questionId == null) {
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("questionId must be an integer"))
            return@get
        }

        when (val result = getQuestionAnswers(questionId)) {
            is QuestionAnswersResult.Success -> call.respond(result.answers)
            QuestionAnswersResult.QuestionNotFound -> call.respond(HttpStatusCode.NotFound, ErrorResponse("Question not found"))
        }
    }
}
