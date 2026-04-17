package dev.gamification.backend.routes.questions

import kotlinx.serialization.Serializable

@Serializable
data class QuestionResponse(
    val questionId: Int,
    val questionSetId: Int,
    val questionType: String,
    val startText: String?,
    val imageUrl: String?,
    val endText: String?,
    val allowsMultiple: Boolean,
    val completed: Boolean,
    val mcAnswers: List<McAnswerResponse> = emptyList(),
    val gapFields: List<GapFieldResponse> = emptyList(),
)

@Serializable
data class QuestionSummaryResponse(
    val questionId: Int,
    val questionType: String,
    val startText: String?,
    val imageUrl: String?,
    val endText: String?,
    val allowsMultiple: Boolean,
    val completed: Boolean,
)

@Serializable
data class McAnswerResponse(
    val answerId: Int,
    val optionText: String,
    val optionOrder: Int,
)

@Serializable
data class GapFieldResponse(
    val gapId: Int,
    val gapIndex: Int,
    val textBefore: String? = null,
    val textAfter: String? = null,
    val options: List<GapOptionResponse> = emptyList(),
)

@Serializable
data class GapOptionResponse(
    val gapOptionId: Int,
    val optionText: String,
    val optionOrder: Int,
)

@Serializable
data class QuestionAnswersResponse(
    val questionId: Int,
    val questionType: String,
    val allowsMultiple: Boolean,
    val mcAnswers: List<McAnswerResponse> = emptyList(),
    val gapFields: List<GapFieldResponse> = emptyList(),
)

@Serializable
data class SubmitAnswerRequest(
    val selectedAnswerIds: List<Int> = emptyList(),
    val gapAnswers: List<GapAnswerInput> = emptyList(),
)

@Serializable
data class GapAnswerInput(
    val gapId: Int,
    val selectedOptionId: Int,
)

@Serializable
data class SubmitAnswerResponse(
    val questionId: Int,
    val questionType: String,
    val isCorrect: Boolean,
    val awardedPoints: Int,
    val completed: Boolean,
)
