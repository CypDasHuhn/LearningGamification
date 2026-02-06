package dev.gamification.backend.db

import org.jetbrains.exposed.sql.Table

class Questions : Table() {
    var questionId = integer("question_id").autoIncrement()

}