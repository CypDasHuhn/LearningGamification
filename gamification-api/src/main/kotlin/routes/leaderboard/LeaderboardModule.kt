package dev.gamification.backend.routes.leaderboard

import dev.gamification.backend.routes.auth.JwtAuthName
import io.ktor.server.application.Application
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

fun Application.configureLeaderboard() {
    routing {
        authenticate(JwtAuthName) {
            route("/leaderboard") {
                registerGetLeaderboardEndpoint()
            }
        }
    }
}
