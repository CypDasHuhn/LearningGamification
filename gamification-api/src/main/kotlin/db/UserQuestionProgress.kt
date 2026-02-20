package dev.gamification.backend.db

import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table

object UserQuestionProgress : Table(name = "user_question_progress") {
    val userId = reference(
        name = "user_id",
        foreign = Users,
        onDelete = ReferenceOption.CASCADE,
        onUpdate = ReferenceOption.CASCADE,
    )
    val questionId = reference(
        name = "question_id",
        foreign = Questions,
        onDelete = ReferenceOption.CASCADE,
        onUpdate = ReferenceOption.CASCADE,
    )
    val completedAt = long("completed_at")

    override val primaryKey = PrimaryKey(userId, questionId)
}
