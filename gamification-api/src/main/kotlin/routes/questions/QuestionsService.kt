package dev.gamification.backend.routes.questions

import dev.gamification.backend.db.GapFields
import dev.gamification.backend.db.GapOptions
import dev.gamification.backend.db.McAnswers
import dev.gamification.backend.db.QuestionSets
import dev.gamification.backend.db.QuestionType
import dev.gamification.backend.db.Questions
import dev.gamification.backend.db.UserQuestionProgress
import dev.gamification.backend.db.dbQuery
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update

fun getQuestionsForUser(userId: Int, questionSetId: Int?): List<QuestionResponse> =
    dbQuery {
        val questionsQuery =
            if (questionSetId != null) {
                Questions.selectAll().where { Questions.questionSetId eq questionSetId }
            } else {
                Questions.selectAll()
            }

        val questionRows = questionsQuery.orderBy(Questions.id to SortOrder.ASC).toList()
        if (questionRows.isEmpty()) {
            return@dbQuery emptyList()
        }

        val questionEntityIds = questionRows.map { it[Questions.id] }

        val mcAnswersByQuestionId =
            McAnswers.selectAll()
                .where { McAnswers.questionId inList questionEntityIds }
                .orderBy(McAnswers.questionId to SortOrder.ASC, McAnswers.optionOrder to SortOrder.ASC)
                .groupBy { it[McAnswers.questionId].value }

        val gapFields =
            GapFields.selectAll()
                .where { GapFields.questionId inList questionEntityIds }
                .orderBy(GapFields.questionId to SortOrder.ASC, GapFields.gapIndex to SortOrder.ASC)
                .toList()

        val gapFieldsByQuestionId = gapFields.groupBy { it[GapFields.questionId].value }
        val gapEntityIds = gapFields.map { it[GapFields.id] }

        val gapOptionsByGapId =
            if (gapEntityIds.isEmpty()) {
                emptyMap()
            } else {
                GapOptions.selectAll()
                    .where { GapOptions.gapId inList gapEntityIds }
                    .orderBy(GapOptions.gapId to SortOrder.ASC, GapOptions.optionOrder to SortOrder.ASC)
                    .groupBy { it[GapOptions.gapId].value }
            }

        val completedQuestionIds =
            UserQuestionProgress.selectAll()
                .where {
                    (UserQuestionProgress.userId eq userId) and
                        (UserQuestionProgress.questionId inList questionEntityIds)
                }
                .map { it[UserQuestionProgress.questionId].value }
                .toSet()

        questionRows.map { question ->
            val questionId = question[Questions.id].value
            val questionType = question[Questions.questionType]

            val mcAnswers =
                if (questionType == QuestionType.MC || questionType == QuestionType.TF) {
                    mcAnswersByQuestionId[questionId].orEmpty().map { answer ->
                        McAnswerResponse(
                            answerId = answer[McAnswers.id].value,
                            optionText = answer[McAnswers.optionText],
                            optionOrder = answer[McAnswers.optionOrder],
                        )
                    }
                } else {
                    emptyList()
                }

            val gapQuestionFields =
                if (questionType == QuestionType.GAP) {
                    gapFieldsByQuestionId[questionId].orEmpty().map { gapField ->
                        val gapId = gapField[GapFields.id].value
                        val options =
                            gapOptionsByGapId[gapId].orEmpty().map { option ->
                                GapOptionResponse(
                                    gapOptionId = option[GapOptions.id].value,
                                    optionText = option[GapOptions.optionText],
                                    optionOrder = option[GapOptions.optionOrder],
                                )
                            }

                        GapFieldResponse(
                            gapId = gapId,
                            gapIndex = gapField[GapFields.gapIndex],
                            textBefore = gapField[GapFields.textBefore],
                            textAfter = gapField[GapFields.textAfter],
                            options = options,
                        )
                    }
                } else {
                    emptyList()
                }

            QuestionResponse(
                questionId = questionId,
                questionSetId = question[Questions.questionSetId].value,
                questionType = questionType.name,
                startText = question[Questions.startText],
                imageUrl = question[Questions.imageUrl],
                endText = question[Questions.endText],
                allowsMultiple = question[Questions.allowsMultiple],
                completed = completedQuestionIds.contains(questionId),
                mcAnswers = mcAnswers,
                gapFields = gapQuestionFields,
            )
        }
    }

fun getQuestionsForQuestionSet(userId: Int, questionSetId: Int): QuestionSetQuestionsResult =
    dbQuery {
        val questionSetExists = QuestionSets.selectAll().where { QuestionSets.id eq questionSetId }.singleOrNull() != null
        if (!questionSetExists) {
            return@dbQuery QuestionSetQuestionsResult.QuestionSetNotFound
        }

        val questionRows =
            Questions.selectAll()
                .where { Questions.questionSetId eq questionSetId }
                .orderBy(Questions.id to SortOrder.ASC)
                .toList()

        if (questionRows.isEmpty()) {
            return@dbQuery QuestionSetQuestionsResult.Success(emptyList())
        }

        val questionEntityIds = questionRows.map { it[Questions.id] }
        val completedQuestionIds =
            UserQuestionProgress.selectAll()
                .where {
                    (UserQuestionProgress.userId eq userId) and
                        (UserQuestionProgress.questionId inList questionEntityIds)
                }
                .map { it[UserQuestionProgress.questionId].value }
                .toSet()

        QuestionSetQuestionsResult.Success(
            questionRows.map { row ->
                val questionId = row[Questions.id].value
                QuestionSummaryResponse(
                    questionId = questionId,
                    questionType = row[Questions.questionType].name,
                    startText = row[Questions.startText],
                    imageUrl = row[Questions.imageUrl],
                    endText = row[Questions.endText],
                    allowsMultiple = row[Questions.allowsMultiple],
                    completed = completedQuestionIds.contains(questionId),
                )
            },
        )
    }

fun getQuestionAnswers(questionId: Int): QuestionAnswersResult =
    dbQuery {
        val question =
            Questions.selectAll()
                .where { Questions.id eq questionId }
                .singleOrNull()
                ?: return@dbQuery QuestionAnswersResult.QuestionNotFound

        val questionType = question[Questions.questionType]
        val allowsMultiple = question[Questions.allowsMultiple]

        val mcAnswers =
            if (questionType == QuestionType.MC || questionType == QuestionType.TF) {
                McAnswers.selectAll()
                    .where { McAnswers.questionId eq questionId }
                    .orderBy(McAnswers.optionOrder to SortOrder.ASC)
                    .map { answer ->
                        McAnswerResponse(
                            answerId = answer[McAnswers.id].value,
                            optionText = answer[McAnswers.optionText],
                            optionOrder = answer[McAnswers.optionOrder],
                        )
                    }
            } else {
                emptyList()
            }

        val gapFields =
            if (questionType == QuestionType.GAP) {
                val fields =
                    GapFields.selectAll()
                        .where { GapFields.questionId eq questionId }
                        .orderBy(GapFields.gapIndex to SortOrder.ASC)
                        .toList()

                val fieldEntityIds = fields.map { it[GapFields.id] }
                val optionsByGapId =
                    if (fieldEntityIds.isEmpty()) {
                        emptyMap()
                    } else {
                        GapOptions.selectAll()
                            .where { GapOptions.gapId inList fieldEntityIds }
                            .orderBy(GapOptions.gapId to SortOrder.ASC, GapOptions.optionOrder to SortOrder.ASC)
                            .groupBy { it[GapOptions.gapId].value }
                    }

                fields.map { field ->
                    val gapId = field[GapFields.id].value
                    GapFieldResponse(
                        gapId = gapId,
                        gapIndex = field[GapFields.gapIndex],
                        textBefore = field[GapFields.textBefore],
                        textAfter = field[GapFields.textAfter],
                        options =
                            optionsByGapId[gapId].orEmpty().map { option ->
                                GapOptionResponse(
                                    gapOptionId = option[GapOptions.id].value,
                                    optionText = option[GapOptions.optionText],
                                    optionOrder = option[GapOptions.optionOrder],
                                )
                            },
                    )
                }
            } else {
                emptyList()
            }

        QuestionAnswersResult.Success(
            QuestionAnswersResponse(
                questionId = questionId,
                questionType = questionType.name,
                allowsMultiple = allowsMultiple,
                mcAnswers = mcAnswers,
                gapFields = gapFields,
            ),
        )
    }

fun submitQuestionAnswer(userId: Int, questionId: Int, request: SubmitAnswerRequest): SubmitQuestionResult {
    val question =
        dbQuery {
            Questions.selectAll()
                .where { Questions.id eq questionId }
                .singleOrNull()
                ?.let {
                    QuestionMeta(
                        id = it[Questions.id].value,
                        type = it[Questions.questionType],
                        allowsMultiple = it[Questions.allowsMultiple],
                        points = it[Questions.points],
                    )
                }
        } ?: return SubmitQuestionResult.NotFound

    val wasCompleted = isQuestionCompleted(userId, question.id)
    val evaluation =
        when (question.type) {
            QuestionType.MC, QuestionType.TF -> evaluateChoiceQuestion(question, request.selectedAnswerIds)
            QuestionType.GAP -> evaluateGapQuestion(question, request.gapAnswers)
        }

    if (evaluation.validationError != null) {
        return SubmitQuestionResult.Invalid(evaluation.validationError)
    }

    if (evaluation.isCorrect) {
        markQuestionCompleted(userId, question.id)
    }

    return SubmitQuestionResult.Success(
        SubmitAnswerResponse(
            questionId = question.id,
            questionType = question.type.name,
            isCorrect = evaluation.isCorrect,
            awardedPoints = evaluation.awardedPoints,
            completed = wasCompleted || evaluation.isCorrect,
        ),
    )
}

sealed interface QuestionSetQuestionsResult {
    data class Success(val questions: List<QuestionSummaryResponse>) : QuestionSetQuestionsResult

    data object QuestionSetNotFound : QuestionSetQuestionsResult
}

sealed interface QuestionAnswersResult {
    data class Success(val answers: QuestionAnswersResponse) : QuestionAnswersResult

    data object QuestionNotFound : QuestionAnswersResult
}

sealed interface SubmitQuestionResult {
    data class Success(val response: SubmitAnswerResponse) : SubmitQuestionResult

    data class Invalid(val message: String) : SubmitQuestionResult

    data object NotFound : SubmitQuestionResult
}

private fun evaluateChoiceQuestion(question: QuestionMeta, selectedAnswerIds: List<Int>): SubmitEvaluation {
    val distinctSelectedIds = selectedAnswerIds.distinct()
    if (distinctSelectedIds.isEmpty()) {
        return SubmitEvaluation(
            isCorrect = false,
            awardedPoints = 0,
            validationError = "selectedAnswerIds must contain at least one answer id",
        )
    }

    if (!question.allowsMultiple && distinctSelectedIds.size > 1) {
        return SubmitEvaluation(
            isCorrect = false,
            awardedPoints = 0,
            validationError = "This question does not allow multiple answers",
        )
    }

    return dbQuery {
        val options =
            McAnswers.selectAll()
                .where { McAnswers.questionId eq question.id }
                .orderBy(McAnswers.optionOrder to SortOrder.ASC)
                .toList()

        if (options.isEmpty()) {
            return@dbQuery SubmitEvaluation(
                isCorrect = false,
                awardedPoints = 0,
                validationError = "Question has no configured answers",
            )
        }

        val validOptionIds = options.map { it[McAnswers.id].value }.toSet()
        if (distinctSelectedIds.any { it !in validOptionIds }) {
            return@dbQuery SubmitEvaluation(
                isCorrect = false,
                awardedPoints = 0,
                validationError = "One or more selected answers are invalid for this question",
            )
        }

        val correctOptionIds = options.filter { it[McAnswers.isCorrect] }.map { it[McAnswers.id].value }.toSet()
        val isCorrect = distinctSelectedIds.toSet() == correctOptionIds
        val awardedPoints =
            if (isCorrect) {
                question.points
            } else {
                0
            }

        SubmitEvaluation(
            isCorrect = isCorrect,
            awardedPoints = awardedPoints,
        )
    }
}

private fun evaluateGapQuestion(question: QuestionMeta, gapAnswers: List<GapAnswerInput>): SubmitEvaluation =
    dbQuery {
        val fields =
            GapFields.selectAll()
                .where { GapFields.questionId eq question.id }
                .orderBy(GapFields.gapIndex to SortOrder.ASC)
                .toList()

        if (fields.isEmpty()) {
            return@dbQuery SubmitEvaluation(
                isCorrect = false,
                awardedPoints = 0,
                validationError = "Question has no configured gap fields",
            )
        }

        val fieldsById = fields.associateBy { it[GapFields.id].value }
        val gapAnswersById = gapAnswers.associateBy { it.gapId }

        if (gapAnswersById.size != gapAnswers.size) {
            return@dbQuery SubmitEvaluation(
                isCorrect = false,
                awardedPoints = 0,
                validationError = "Duplicate gapId values are not allowed",
            )
        }

        if (gapAnswersById.keys.any { it !in fieldsById.keys }) {
            return@dbQuery SubmitEvaluation(
                isCorrect = false,
                awardedPoints = 0,
                validationError = "One or more gap answers do not belong to this question",
            )
        }

        if (fieldsById.keys.any { it !in gapAnswersById.keys }) {
            return@dbQuery SubmitEvaluation(
                isCorrect = false,
                awardedPoints = 0,
                validationError = "All gap fields must be answered",
            )
        }

        val fieldEntityIds = fields.map { it[GapFields.id] }
        val optionsByGapId =
            GapOptions.selectAll()
                .where { GapOptions.gapId inList fieldEntityIds }
                .orderBy(GapOptions.gapId to SortOrder.ASC, GapOptions.optionOrder to SortOrder.ASC)
                .groupBy { it[GapOptions.gapId].value }

        var correctCount = 0
        for (field in fields) {
            val gapId = field[GapFields.id].value
            val answer = gapAnswersById[gapId]
                ?: return@dbQuery SubmitEvaluation(
                    isCorrect = false,
                    awardedPoints = 0,
                    validationError = "All gap fields must be answered",
                )

            val selectedOptionId = answer.selectedOptionId

            val options = optionsByGapId[gapId].orEmpty()
            val selectedOption = options.firstOrNull { it[GapOptions.id].value == selectedOptionId }
                ?: return@dbQuery SubmitEvaluation(
                    isCorrect = false,
                    awardedPoints = 0,
                    validationError = "Invalid selected option for gapId=$gapId",
                )

            val isCorrect = selectedOption[GapOptions.isCorrect]

            if (isCorrect) {
                correctCount += 1
            }
        }

        val allCorrect = correctCount == fields.size
        SubmitEvaluation(
            isCorrect = allCorrect,
            awardedPoints = if (allCorrect) question.points else 0,
        )
    }

private fun isQuestionCompleted(userId: Int, questionId: Int): Boolean =
    dbQuery {
        UserQuestionProgress.selectAll()
            .where {
                (UserQuestionProgress.userId eq userId) and
                    (UserQuestionProgress.questionId eq questionId)
            }
            .singleOrNull() != null
    }

private fun markQuestionCompleted(userId: Int, questionId: Int) {
    dbQuery {
        val updatedCount =
            UserQuestionProgress.update(
                where = {
                    (UserQuestionProgress.userId eq userId) and
                        (UserQuestionProgress.questionId eq questionId)
                },
            ) {
                it[completedAt] = System.currentTimeMillis()
            }

        if (updatedCount == 0) {
            UserQuestionProgress.insert {
                it[UserQuestionProgress.userId] = userId
                it[UserQuestionProgress.questionId] = questionId
                it[completedAt] = System.currentTimeMillis()
            }
        }
    }
}

private data class QuestionMeta(
    val id: Int,
    val type: QuestionType,
    val allowsMultiple: Boolean,
    val points: Int,
)

private data class SubmitEvaluation(
    val isCorrect: Boolean,
    val awardedPoints: Int,
    val validationError: String? = null,
)
