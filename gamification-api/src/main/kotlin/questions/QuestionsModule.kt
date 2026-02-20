package dev.gamification.backend.questions

import dev.gamification.backend.auth.JwtAuthName
import io.ktor.server.application.Application
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

fun Application.configureQuestions() {
    routing {
        authenticate(JwtAuthName) {
            route("/questions") {
                registerGetQuestionsEndpoint()
                registerGetQuestionAnswersEndpoint()
                registerSubmitQuestionEndpoint()
            }
        }
    }
}
