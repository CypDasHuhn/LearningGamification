package dev.gamification.backend.themes

import dev.gamification.backend.auth.JwtAuthName
import io.ktor.server.application.Application
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

fun Application.configureThemes() {
    routing {
        authenticate(JwtAuthName) {
            route("/themes") {
                registerGetThemesEndpoint()
                registerGetThemeQuestionSetsEndpoint()
            }
        }
    }
}
