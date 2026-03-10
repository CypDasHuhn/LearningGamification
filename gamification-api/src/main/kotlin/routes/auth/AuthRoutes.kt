package dev.gamification.backend.routes.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.jwt.*
import io.ktor.server.routing.*

fun Application.configureAuth() {
    val jwtSecret = environment.config.propertyOrNull("app.auth.jwt.secret")?.getString() ?: defaultJwtSecret
    val jwtAlgorithm = Algorithm.HMAC256(jwtSecret)
    val jwtVerifier = JWT.require(jwtAlgorithm).withIssuer("dev.gamification.backend").withAudience("gamification-api-users").build()

    install(Authentication) {
        jwt(JwtAuthName) {
            realm = "gamification-api"
            verifier(jwtVerifier)
            validate { credential ->
                val userId = credential.payload.getClaim(jwtUserIdClaim).asInt()
                val userName = credential.payload.getClaim(jwtUserNameClaim).asString()

                if (userId != null && !userName.isNullOrBlank()) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
            challenge { _, _ ->
                throw Exception("Invalid or expired token") // Optional: kann angepasst werden
            }
        }
    }

    routing {
        route("/auth") {
            registerRoute(jwtAlgorithm)
            loginRoute(jwtAlgorithm)
            meRoute()
        }
    }
}