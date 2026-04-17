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

    val statements =
            stream.bufferedReader(StandardCharsets.UTF_8).useLines { lines ->
                lines
                        .map { it.trim() }
                        .filter { it.isNotEmpty() && !it.startsWith("--") }
                        .map { it.removeSuffix(";") }
                        .toList()
            }

    val transaction = TransactionManager.current()
    statements.forEach { statement ->
        transaction.exec(statement)
    }
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
