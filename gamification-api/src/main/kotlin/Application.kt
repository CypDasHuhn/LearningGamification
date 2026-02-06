package dev.gamification.backend

import dev.gamification.backend.db.configureDatabases
import dev.gamification.backend.demo.configureRouting
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.resources.Resources

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureHTTP()
    install(ContentNegotiation)
    configureDatabases()
    configureRouting()
    install(Resources)
}
