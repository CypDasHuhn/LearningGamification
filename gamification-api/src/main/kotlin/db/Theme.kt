package dev.gamification.backend.db

import org.jetbrains.exposed.dao.id.IntIdTable

object Themes : IntIdTable(name = "theme", columnName = "theme_id") {
    val name = varchar("name", 255)
    val description = text("description").nullable()
}
