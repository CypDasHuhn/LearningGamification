package dev.gamification.backend.categories

import dev.gamification.backend.db.QuestionThemes
import dev.gamification.backend.db.Themes
import dev.gamification.backend.db.dbQuery
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.selectAll

fun getAllCategories(): List<CategoryResponse> =
    dbQuery {
        val questionCountByThemeId =
            QuestionThemes.selectAll()
                .groupBy { it[QuestionThemes.themeId].value }
                .mapValues { (_, rows) -> rows.size }

        Themes.selectAll()
            .orderBy(Themes.name to SortOrder.ASC)
            .map { row ->
                val categoryId = row[Themes.id].value
                CategoryResponse(
                    categoryId = categoryId,
                    name = row[Themes.name],
                    description = row[Themes.description],
                    questionCount = questionCountByThemeId[categoryId] ?: 0,
                )
            }
    }
