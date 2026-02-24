package dev.gamification.backend.db

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption

object QuestionSets : IntIdTable(name = "question_set", columnName = "question_set_id") {
    val teamId = reference(
        name = "team_id",
        foreign = Teams,
        onDelete = ReferenceOption.CASCADE,
        onUpdate = ReferenceOption.CASCADE,
    )
    val title = varchar("title", 255)

    init {
        index(customIndexName = "idx_question_set_team_id", isUnique = false, teamId)
    }
}
