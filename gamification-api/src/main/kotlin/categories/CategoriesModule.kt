package dev.gamification.backend.categories

import dev.gamification.backend.auth.JwtAuthName
import io.ktor.server.application.Application
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

fun Application.configureCategories() {
    routing {
        authenticate(JwtAuthName) {
            route("/categories") {
                registerGetCategoriesEndpoint()
            }
        }
    }
}
