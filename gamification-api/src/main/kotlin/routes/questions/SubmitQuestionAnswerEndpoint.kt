package dev.gamification.backend.routes.questions

import dev.gamification.backend.routes.auth.ErrorResponse
import dev.gamification.backend.routes.auth.userIdClaim
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post

fun Route.registerSubmitQuestionEndpoint() {
    post("/{questionId}/answer") {
        call.handleSubmitQuestionAnswer()
    }

    post("/{questionId}/submit") {
        call.handleSubmitQuestionAnswer()
    }
}

private suspend fun ApplicationCall.handleSubmitQuestionAnswer() {
    val userId = userIdClaim()
    if (userId == null) {
        respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired token"))
        return
    }

    val questionId = parameters["questionId"]?.toIntOrNull()
    if (questionId == null) {
        respond(HttpStatusCode.BadRequest, ErrorResponse("questionId must be an integer"))
        return
    }

    val request = try {
        receive<SubmitAnswerRequest>()
    } catch (_: Exception) {
        respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid request body"))
        return
    }

    when (val result = submitQuestionAnswer(userId, questionId, request)) {
        is SubmitQuestionResult.Success -> respond(result.response)
        is SubmitQuestionResult.Invalid -> respond(HttpStatusCode.BadRequest, ErrorResponse(result.message))
        SubmitQuestionResult.NotFound -> respond(HttpStatusCode.NotFound, ErrorResponse("Question not found"))
    }
}
