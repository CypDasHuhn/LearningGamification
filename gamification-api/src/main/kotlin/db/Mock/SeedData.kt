package dev.gamification.backend.db

import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.TransactionManager
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

private const val FIRST_SEEDED_QUESTION_ID = 1
private const val DEMO_USER_NAME = "demo-user"
private const val DEMO_USER_PASSWORD = "demo-pass-123"
private const val SQLITE_SEED_RESOURCE_PATH = "seed/questions-seed.sqlite.sql"

fun seedMockData() {
    if (Questions.selectAll().where { Questions.id eq FIRST_SEEDED_QUESTION_ID }.limit(1).firstOrNull() != null) {
        return
    }

    seedQuestionsFromSqlResource()
    seedDemoUser()
}

private fun seedQuestionsFromSqlResource() {
    val stream =
            Thread.currentThread().contextClassLoader.getResourceAsStream(SQLITE_SEED_RESOURCE_PATH)
                    ?: error("Missing seed SQL resource: $SQLITE_SEED_RESOURCE_PATH")

    val sqlText = stream.bufferedReader(StandardCharsets.UTF_8).use { it.readText() }
    val statements = parseSqlStatements(sqlText)

    val transaction = TransactionManager.current()
    statements.forEach { statement ->
        transaction.exec(statement)
    }
}

private fun parseSqlStatements(sqlText: String): List<String> {
    val statements = mutableListOf<String>()
    val current = StringBuilder()
    var inSingleQuote = false
    var index = 0

    while (index < sqlText.length) {
        val char = sqlText[index]

        if (!inSingleQuote && char == '-' && index + 1 < sqlText.length && sqlText[index + 1] == '-') {
            while (index < sqlText.length && sqlText[index] != '\n') {
                index++
            }
            continue
        }

        current.append(char)

        if (char == '\'') {
            if (inSingleQuote) {
                if (index + 1 < sqlText.length && sqlText[index + 1] == '\'') {
                    current.append(sqlText[index + 1])
                    index++
                } else {
                    inSingleQuote = false
                }
            } else {
                inSingleQuote = true
            }
        } else if (char == ';' && !inSingleQuote) {
            val statement = current.toString().trim().removeSuffix(";").trim()
            if (statement.isNotEmpty()) {
                statements.add(statement)
            }
            current.setLength(0)
        }

        index++
    }

    val trailing = current.toString().trim().removeSuffix(";").trim()
    if (trailing.isNotEmpty()) {
        statements.add(trailing)
    }

    return statements
}

private fun seedDemoUser() {
    val now = System.currentTimeMillis()
    val existingDemoUser = Users.selectAll().where { Users.userName eq DEMO_USER_NAME }.limit(1).firstOrNull()

    val demoUserId =
            existingDemoUser?.get(Users.id)
                    ?: Users.insertAndGetId {
                        it[userName] = DEMO_USER_NAME
                        it[passwordHash] = hashPassword(DEMO_USER_PASSWORD)
                        it[createdAt] = now
                    }

    val existingProgress =
            UserQuestionProgress
                    .selectAll()
                    .where {
                        (UserQuestionProgress.userId eq demoUserId) and
                                (UserQuestionProgress.questionId eq FIRST_SEEDED_QUESTION_ID)
                    }
                    .limit(1)
                    .firstOrNull()

    if (existingProgress == null) {
        UserQuestionProgress.insert {
            it[userId] = demoUserId
            it[questionId] = FIRST_SEEDED_QUESTION_ID
            it[completedAt] = now
        }
    }
}

private fun hashPassword(password: String): String {
    val digest = MessageDigest.getInstance("SHA-256")
    val hash = digest.digest(password.toByteArray(StandardCharsets.UTF_8))
    return hash.joinToString("") { "%02x".format(it) }
}
