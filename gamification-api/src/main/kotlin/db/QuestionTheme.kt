package dev.gamification.backend.db

import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table

object QuestionThemes : Table(name = "Question_Theme") {
    val questionId = reference(
        name = "question_id",
        foreign = Questions,
        onDelete = ReferenceOption.CASCADE,
        onUpdate = ReferenceOption.CASCADE,
    )
    val themeId = reference(
        name = "theme_id",
        foreign = Themes,
        onDelete = ReferenceOption.RESTRICT,
        onUpdate = ReferenceOption.CASCADE,
    )

    override val primaryKey = PrimaryKey(questionId, themeId)

    init {
        index(customIndexName = "idx_question_theme_theme", isUnique = false, themeId)
        index(customIndexName = "idx_question_theme_question", isUnique = false, questionId)
    }
}
