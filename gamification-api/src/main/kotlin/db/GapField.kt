package dev.gamification.backend.db

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption

object GapFields : IntIdTable(name = "gap_field", columnName = "gap_id") {
    val questionId = reference(
        name = "question_id",
        foreign = Questions,
        onDelete = ReferenceOption.CASCADE,
        onUpdate = ReferenceOption.CASCADE,
    )
    val gapIndex = integer("gap_index")
    val textBefore = text("text_before").nullable()
    val textAfter = text("text_after").nullable()

    init {
        index(customIndexName = "uq_gap_field_question_index", isUnique = true, questionId, gapIndex)
        index(customIndexName = "idx_gap_field_question", isUnique = false, questionId)
    }
}

object GapOptions : IntIdTable(name = "gap_option", columnName = "gap_option_id") {
    val gapId = reference(
        name = "gap_id",
        foreign = GapFields,
        onDelete = ReferenceOption.CASCADE,
        onUpdate = ReferenceOption.CASCADE,
    )
    val optionText = text("option_text")
    val isCorrect = bool("is_correct").default(false)
    val optionOrder = integer("option_order")

    init {
        index(customIndexName = "uq_gap_option_gap_order", isUnique = true, gapId, optionOrder)
        index(customIndexName = "idx_gap_option_gap", isUnique = false, gapId)
    }
}
