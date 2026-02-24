package dev.gamification.backend.db

import org.jetbrains.exposed.dao.id.IntIdTable

object Teams : IntIdTable(name = "team", columnName = "team_id") {
    val name = varchar("name", 255)
}
