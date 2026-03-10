package dev.gamification.backend.db

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption

enum class QuestionType {
    MC,
    TF,
    GAP,
}

object Questions : IntIdTable(name = "question", columnName = "question_id") {
    val questionSetId = reference(
        name = "question_set_id",
        foreign = QuestionSets,
        onDelete = ReferenceOption.CASCADE,
        onUpdate = ReferenceOption.CASCADE,
    )
    val questionType = enumerationByName("question_type", 8, QuestionType::class)
    val startText = text("start_text").nullable()
    val imageUrl = text("image_url").nullable()
    val endText = text("end_text").nullable()
    val allowsMultiple = bool("allows_multiple").default(false)
    val points = integer("points").default(1)

    init {
        index(customIndexName = "idx_question_question_set", isUnique = false, questionSetId)
        index(customIndexName = "idx_question_type", isUnique = false, questionType)
    }
}
