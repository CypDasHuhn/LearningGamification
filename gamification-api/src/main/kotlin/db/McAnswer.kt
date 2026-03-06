package dev.gamification.backend.db

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption

object McAnswers : IntIdTable(name = "mc_answer", columnName = "answer_id") {
    val questionId = reference(
        name = "question_id",
        foreign = Questions,
        onDelete = ReferenceOption.CASCADE,
        onUpdate = ReferenceOption.CASCADE,
    )
    val optionText = text("option_text")
    val isCorrect = bool("is_correct").default(false)
    val optionOrder = integer("option_order")

    init {
        index(customIndexName = "uq_mc_answer_question_order", isUnique = true, questionId, optionOrder)
        index(customIndexName = "idx_mc_answer_question", isUnique = false, questionId)
    }
}
