package dev.gamification.backend.db

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ResultRow

object Users : IntIdTable("users") {
    val userName = varchar("username", 64).uniqueIndex()
    val passwordHash = varchar("password_hash", 64)
    val createdAt = long("created_at")
}

data class UserRecord(
    val id: Int,
    val userName: String,
    val passwordHash: String,
)

fun ResultRow.toUserRecord(): UserRecord = UserRecord(
    id = this[Users.id].value,
    userName = this[Users.userName],
    passwordHash = this[Users.passwordHash],
)
