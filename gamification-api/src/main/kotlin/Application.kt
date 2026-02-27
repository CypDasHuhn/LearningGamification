package dev.gamification.backend

import dev.gamification.backend.db.configureDatabases
import dev.gamification.backend.routes.configureOpenApi
import dev.gamification.backend.routes.auth.configureAuth
import dev.gamification.backend.routes.demo.configureRouting
import dev.gamification.backend.routes.questions.configureQuestionSets
import dev.gamification.backend.routes.questions.configureQuestions
import dev.gamification.backend.routes.themes.configureThemes
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.resources.Resources

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureHTTP()
    install(Resources)
    install(ContentNegotiation) {
        json()
    }
    configureDatabases()
    configureOpenApi()
    configureAuth()
    configureThemes()
    configureQuestionSets()
    configureQuestions()
    configureRouting()
}
