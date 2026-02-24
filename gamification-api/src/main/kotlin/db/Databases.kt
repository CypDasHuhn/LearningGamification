package dev.gamification.backend.db

import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.transactions.transaction

private lateinit var database: Database
private const val sqliteDatabaseUrl = "jdbc:sqlite:./kls_database.db?foreign_keys=on"

fun Application.configureDatabases() {
    database = Database.connect(
        url = sqliteDatabaseUrl,
        driver = "org.sqlite.JDBC",
    )

    transaction(database) {
        SchemaUtils.create(
            Teams,
            Themes,
            QuestionSets,
            Questions,
            QuestionThemes,
            McAnswers,
            GapFields,
            GapOptions,
            Users,
            UserQuestionProgress,
        )
    }
}

fun <T> dbQuery(block: Transaction.() -> T): T = transaction(database) { block() }
