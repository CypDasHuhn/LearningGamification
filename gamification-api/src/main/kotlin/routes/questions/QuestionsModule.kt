package dev.gamification.backend.routes.questions

import dev.gamification.backend.routes.auth.JwtAuthName
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
