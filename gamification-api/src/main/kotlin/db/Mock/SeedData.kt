package dev.gamification.backend.db

import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.selectAll
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

fun seedMockData() {
    if (Teams.selectAll().limit(1).firstOrNull() != null) {
        return
    }

    val engineeringTeamId = Teams.insertAndGetId {
        it[name] = "Engineering"
    }
    val productTeamId = Teams.insertAndGetId {
        it[name] = "Product"
    }

    val kotlinThemeId = Themes.insertAndGetId {
        it[name] = "Kotlin Basics"
        it[description] = "Core Kotlin concepts for backend developers."
    }
    val ktorThemeId = Themes.insertAndGetId {
        it[name] = "Ktor"
        it[description] = "Routing, plugins, and request handling."
    }

    val backendSetId = QuestionSets.insertAndGetId {
        it[teamId] = engineeringTeamId
        it[title] = "Backend Fundamentals"
    }
    val onboardingSetId = QuestionSets.insertAndGetId {
        it[teamId] = productTeamId
        it[title] = "Product Onboarding"
    }

    val mcQuestionId = Questions.insertAndGetId {
        it[questionSetId] = backendSetId
        it[questionType] = QuestionType.MC
        it[startText] = "What does JVM stand for?"
        it[imageUrl] = null
        it[endText] = null
        it[allowsMultiple] = false
    }

    val tfQuestionId = Questions.insertAndGetId {
        it[questionSetId] = onboardingSetId
        it[questionType] = QuestionType.TF
        it[startText] = "A product requirement document should define success metrics."
        it[imageUrl] = null
        it[endText] = null
        it[allowsMultiple] = false
    }

    val gapQuestionId = Questions.insertAndGetId {
        it[questionSetId] = backendSetId
        it[questionType] = QuestionType.GAP
        it[startText] = "Ktor is built with"
        it[imageUrl] = null
        it[endText] = "coroutines."
        it[allowsMultiple] = false
    }

    QuestionThemes.insert {
        it[questionId] = mcQuestionId
        it[themeId] = kotlinThemeId
    }
    QuestionThemes.insert {
        it[questionId] = gapQuestionId
        it[themeId] = ktorThemeId
    }
    QuestionThemes.insert {
        it[questionId] = tfQuestionId
        it[themeId] = kotlinThemeId
    }

    McAnswers.insert {
        it[questionId] = mcQuestionId
        it[optionText] = "Java Virtual Machine"
        it[points] = 10
        it[isCorrect] = true
        it[optionOrder] = 1
    }
    McAnswers.insert {
        it[questionId] = mcQuestionId
        it[optionText] = "Java Variable Method"
        it[points] = 0
        it[isCorrect] = false
        it[optionOrder] = 2
    }
    McAnswers.insert {
        it[questionId] = tfQuestionId
        it[optionText] = "True"
        it[points] = 10
        it[isCorrect] = true
        it[optionOrder] = 1
    }
    McAnswers.insert {
        it[questionId] = tfQuestionId
        it[optionText] = "False"
        it[points] = 0
        it[isCorrect] = false
        it[optionOrder] = 2
    }

    val gapFieldId = GapFields.insertAndGetId {
        it[questionId] = gapQuestionId
        it[gapIndex] = 0
        it[inputType] = GapInputType.CHOICE
        it[correctText] = null
        it[caseSensitive] = false
    }

    GapOptions.insert {
        it[gapId] = gapFieldId
        it[optionText] = "Kotlin"
        it[isCorrect] = true
        it[optionOrder] = 1
    }
    GapOptions.insert {
        it[gapId] = gapFieldId
        it[optionText] = "Ruby"
        it[isCorrect] = false
        it[optionOrder] = 2
    }

    val demoUserId = Users.insertAndGetId {
        it[userName] = "demo-user"
        it[passwordHash] = hashPassword("demo-pass-123")
        it[createdAt] = System.currentTimeMillis()
    }

    UserQuestionProgress.insert {
        it[userId] = demoUserId
        it[questionId] = mcQuestionId
        it[completedAt] = System.currentTimeMillis()
    }
}

private fun hashPassword(password: String): String {
    val digest = MessageDigest.getInstance("SHA-256")
    val hash = digest.digest(password.toByteArray(StandardCharsets.UTF_8))
    return hash.joinToString("") { "%02x".format(it) }
}
