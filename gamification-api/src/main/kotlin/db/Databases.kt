package dev.gamification.backend.db

import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.transactions.transaction

private const val DEFAULT_SQLITE_URL = "jdbc:sqlite:./kls_database.db?foreign_keys=on"
private lateinit var database: Database

fun Application.configureDatabases() {
    val seedEnabled =
            environment
                    .config
                    .propertyOrNull("app.seed.enabled")
                    ?.getString()
                    ?.toBooleanStrictOrNull()
                    ?: false

    val mysqlEnabled =
            environment
                    .config
                    .propertyOrNull("app.database.mysql.enabled")
                    ?.getString()
                    ?.toBooleanStrictOrNull()
                    ?: false

    database = if (mysqlEnabled) mysqlConnection() else sqliteConnection()

    transaction(database) {
        SchemaUtils.createMissingTablesAndColumns(
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

        if (seedEnabled) {
            seedMockData()
        }
    }
}

private fun Application.sqliteConnection(): Database {
    val sqliteDatabaseUrl =
            environment
                    .config
                    .propertyOrNull("app.database.sqlite.url")
                    ?.getString()
                    ?: DEFAULT_SQLITE_URL

    return Database.connect(
            url = sqliteDatabaseUrl,
            driver = "org.sqlite.JDBC",
    )
}

private fun Application.mysqlConnection(): Database {
    val mysqlDatabaseUrl = requiredConfig("app.database.mysql.url")
    val mysqlUser = requiredConfig("app.database.mysql.user")
    val mysqlPassword = requiredConfig("app.database.mysql.password")

    return Database.connect(
            url = mysqlDatabaseUrl,
            driver = "com.mysql.cj.jdbc.Driver",
            user = mysqlUser,
            password = mysqlPassword,
    )
}

private fun Application.requiredConfig(path: String): String {
    return environment.config.propertyOrNull(path)?.getString()?.takeIf { it.isNotBlank() }
            ?: error("Missing required config value: $path")
}

fun <T> dbQuery(block: Transaction.() -> T): T = transaction(database) { block() }
