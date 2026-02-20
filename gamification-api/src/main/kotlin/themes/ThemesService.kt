package dev.gamification.backend.themes

import dev.gamification.backend.db.QuestionSets
import dev.gamification.backend.db.QuestionThemes
import dev.gamification.backend.db.Questions
import dev.gamification.backend.db.Themes
import dev.gamification.backend.db.dbQuery
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.selectAll

fun getAllThemes(): List<ThemeResponse> =
    dbQuery {
        val questionCountByThemeId =
            QuestionThemes.selectAll()
                .groupBy { it[QuestionThemes.themeId].value }
                .mapValues { (_, rows) -> rows.size }

        Themes.selectAll()
            .orderBy(Themes.name to SortOrder.ASC)
            .map { row ->
                val themeId = row[Themes.id].value
                ThemeResponse(
                    themeId = themeId,
                    name = row[Themes.name],
                    description = row[Themes.description],
                    questionCount = questionCountByThemeId[themeId] ?: 0,
                )
            }
    }

fun getThemeQuestionSets(themeId: Int): ThemeQuestionSetsResult =
    dbQuery {
        val themeExists = Themes.selectAll().where { Themes.id eq themeId }.singleOrNull() != null
        if (!themeExists) {
            return@dbQuery ThemeQuestionSetsResult.ThemeNotFound
        }

        val themedQuestionIds =
            QuestionThemes.selectAll()
                .where { QuestionThemes.themeId eq themeId }
                .map { it[QuestionThemes.questionId] }
                .distinct()

        if (themedQuestionIds.isEmpty()) {
            return@dbQuery ThemeQuestionSetsResult.Success(emptyList())
        }

        val questionSetCounts =
            Questions.selectAll()
                .where { Questions.id inList themedQuestionIds }
                .groupBy { it[Questions.questionSetId].value }
                .mapValues { (_, rows) -> rows.size }

        val questionSetIds = questionSetCounts.keys.toList()
        if (questionSetIds.isEmpty()) {
            return@dbQuery ThemeQuestionSetsResult.Success(emptyList())
        }

        val questionSets =
            QuestionSets.selectAll()
                .where { QuestionSets.id inList questionSetIds }
                .orderBy(QuestionSets.title to SortOrder.ASC)
                .map { row ->
                    val questionSetId = row[QuestionSets.id].value
                    ThemeQuestionSetResponse(
                        questionSetId = questionSetId,
                        title = row[QuestionSets.title],
                        teamId = row[QuestionSets.teamId].value,
                        questionCount = questionSetCounts[questionSetId] ?: 0,
                    )
                }

        ThemeQuestionSetsResult.Success(questionSets)
    }

sealed interface ThemeQuestionSetsResult {
    data class Success(val questionSets: List<ThemeQuestionSetResponse>) : ThemeQuestionSetsResult

    data object ThemeNotFound : ThemeQuestionSetsResult
}
