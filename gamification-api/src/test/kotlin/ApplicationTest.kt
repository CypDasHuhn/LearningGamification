package dev.gamification.backend

import io.ktor.client.request.*
import io.ktor.client.statement.bodyAsText
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class ApplicationTest {

    @Test fun testRoot() = testApplication { application { module() } }

    @Test
    fun testCorsPreflightForJsonAndAuthHeaders() = testApplication {
        application { module() }

        val response =
            client.options("/auth/login") {
                header(HttpHeaders.Origin, "http://localhost:5173")
                header(HttpHeaders.AccessControlRequestMethod, HttpMethod.Post.value)
                header(HttpHeaders.AccessControlRequestHeaders, "content-type,authorization")
            }

        assertTrue(response.status.value in 200..299)
        val allowOrigin = response.headers[HttpHeaders.AccessControlAllowOrigin]
        assertTrue(allowOrigin == "*" || allowOrigin == "http://localhost:5173")

        val allowedHeaders = response.headers[HttpHeaders.AccessControlAllowHeaders].orEmpty().lowercase()
        assertTrue(allowedHeaders.contains("content-type"))
        assertTrue(allowedHeaders.contains("authorization"))
    }

    @Test
    fun testRegisterAndLoginFlow() = testApplication {
        application { module() }
        val userName = "testuser-${System.currentTimeMillis()}"

        val registerResponse =
                client.post("/auth/register") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"userName":"$userName","password":"strongpass123"}""")
                }
        assertEquals(HttpStatusCode.Created, registerResponse.status)

        val duplicateRegisterResponse =
                client.post("/auth/register") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"userName":"$userName","password":"strongpass123"}""")
                }
        assertEquals(HttpStatusCode.Conflict, duplicateRegisterResponse.status)

        val badLoginResponse =
                client.post("/auth/login") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"userName":"$userName","password":"wrongpass123"}""")
                }
        assertEquals(HttpStatusCode.Unauthorized, badLoginResponse.status)

        val loginResponse =
                client.post("/auth/login") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"userName":"$userName","password":"strongpass123"}""")
                }
        assertEquals(HttpStatusCode.OK, loginResponse.status)

        val token =
                "\"token\":\"([^\"]+)\""
                        .toRegex()
                        .find(loginResponse.bodyAsText())
                        ?.groupValues
                        ?.get(1)

        assertTrue(!token.isNullOrBlank())

        val meResponse =
                client.get("/auth/me") { header(HttpHeaders.Authorization, "Bearer $token") }
        assertEquals(HttpStatusCode.OK, meResponse.status)
    }

    @Test
    fun testGetQuestionsAndSubmitAnswer() = testApplication {
        application { module() }
        val userName = "question-user-${System.currentTimeMillis()}"

        val registerResponse =
            client.post("/auth/register") {
                contentType(ContentType.Application.Json)
                setBody("""{"userName":"$userName","password":"strongpass123"}""")
            }
        assertEquals(HttpStatusCode.Created, registerResponse.status)

        val token =
            "\"token\":\"([^\"]+)\""
                .toRegex()
                .find(registerResponse.bodyAsText())
                ?.groupValues
                ?.get(1)
        assertTrue(!token.isNullOrBlank())

        val questionsResponse =
            client.get("/questions") {
                header(HttpHeaders.Authorization, "Bearer $token")
            }
        assertEquals(HttpStatusCode.OK, questionsResponse.status)

        val questionsJson = Json.parseToJsonElement(questionsResponse.bodyAsText()).jsonArray
        assertTrue(questionsJson.isNotEmpty())

        val mcQuestion =
            questionsJson.firstOrNull {
                val question = it.jsonObject
                question["startText"]?.jsonPrimitive?.content == "What does JVM stand for?"
            }?.jsonObject
        assertNotNull(mcQuestion)

        val questionId = mcQuestion["questionId"]!!.jsonPrimitive.int
        val correctAnswerId =
            mcQuestion["mcAnswers"]!!
                .jsonArray
                .firstOrNull { answer ->
                    answer.jsonObject["optionText"]?.jsonPrimitive?.content == "Java Virtual Machine"
                }
                ?.jsonObject
                ?.get("answerId")
                ?.jsonPrimitive
                ?.int
        assertNotNull(correctAnswerId)

        val submitResponse =
            client.post("/questions/$questionId/submit") {
                header(HttpHeaders.Authorization, "Bearer $token")
                contentType(ContentType.Application.Json)
                setBody("""{"selectedAnswerIds":[$correctAnswerId]}""")
            }
        assertEquals(HttpStatusCode.OK, submitResponse.status)

        val submitJson = Json.parseToJsonElement(submitResponse.bodyAsText()).jsonObject
        assertTrue(submitJson["isCorrect"]!!.jsonPrimitive.boolean)
        assertTrue(submitJson["completed"]!!.jsonPrimitive.boolean)

        val refreshedQuestionsResponse =
            client.get("/questions") {
                header(HttpHeaders.Authorization, "Bearer $token")
            }
        assertEquals(HttpStatusCode.OK, refreshedQuestionsResponse.status)

        val refreshedQuestions = Json.parseToJsonElement(refreshedQuestionsResponse.bodyAsText()).jsonArray
        val updatedQuestion =
            refreshedQuestions.firstOrNull {
                it.jsonObject["questionId"]?.jsonPrimitive?.int == questionId
            }?.jsonObject
        assertNotNull(updatedQuestion)
        assertTrue(updatedQuestion["completed"]!!.jsonPrimitive.boolean)
    }

    @Test
    fun testThemeToQuestionAnswerFlow() = testApplication {
        application { module() }
        val userName = "theme-flow-user-${System.currentTimeMillis()}"

        val registerResponse =
            client.post("/auth/register") {
                contentType(ContentType.Application.Json)
                setBody("""{"userName":"$userName","password":"strongpass123"}""")
            }
        assertEquals(HttpStatusCode.Created, registerResponse.status)

        val token =
            "\"token\":\"([^\"]+)\""
                .toRegex()
                .find(registerResponse.bodyAsText())
                ?.groupValues
                ?.get(1)
        assertTrue(!token.isNullOrBlank())

        val themesResponse =
            client.get("/themes") {
                header(HttpHeaders.Authorization, "Bearer $token")
            }
        assertEquals(HttpStatusCode.OK, themesResponse.status)
        val themes = Json.parseToJsonElement(themesResponse.bodyAsText()).jsonArray
        assertTrue(themes.isNotEmpty())

        val themeId = themes.first().jsonObject["themeId"]!!.jsonPrimitive.int
        val questionSetsResponse =
            client.get("/themes/$themeId/question-sets") {
                header(HttpHeaders.Authorization, "Bearer $token")
            }
        assertEquals(HttpStatusCode.OK, questionSetsResponse.status)
        val questionSets = Json.parseToJsonElement(questionSetsResponse.bodyAsText()).jsonArray
        assertTrue(questionSets.isNotEmpty())

        val questionSetId = questionSets.first().jsonObject["questionSetId"]!!.jsonPrimitive.int
        val questionsResponse =
            client.get("/question-sets/$questionSetId/questions") {
                header(HttpHeaders.Authorization, "Bearer $token")
            }
        assertEquals(HttpStatusCode.OK, questionsResponse.status)
        val questions = Json.parseToJsonElement(questionsResponse.bodyAsText()).jsonArray
        assertTrue(questions.isNotEmpty())

        val questionId = questions.first().jsonObject["questionId"]!!.jsonPrimitive.int
        val answersResponse =
            client.get("/questions/$questionId/answers") {
                header(HttpHeaders.Authorization, "Bearer $token")
            }
        assertEquals(HttpStatusCode.OK, answersResponse.status)
        val answers = Json.parseToJsonElement(answersResponse.bodyAsText()).jsonObject

        val submitPayload = buildSubmitPayload(answers)
        val submitResponse =
            client.post("/questions/$questionId/answer") {
                header(HttpHeaders.Authorization, "Bearer $token")
                contentType(ContentType.Application.Json)
                setBody(submitPayload)
            }
        assertEquals(HttpStatusCode.OK, submitResponse.status)
    }

    private fun buildSubmitPayload(answers: JsonObject): String {
        val questionType = answers["questionType"]!!.jsonPrimitive.content
        return when (questionType) {
            "MC", "TF" -> {
                val selectedAnswerId = answers["mcAnswers"]!!.jsonArray.first().jsonObject["answerId"]!!.jsonPrimitive.int
                """{"selectedAnswerIds":[$selectedAnswerId]}"""
            }
            "GAP" -> {
                val gapAnswersJson =
                    answers["gapFields"]!!.jsonArray.joinToString(separator = ",") { gapFieldElement ->
                        val gapField = gapFieldElement.jsonObject
                        val gapId = gapField["gapId"]!!.jsonPrimitive.int
                        val inputType = gapField["inputType"]!!.jsonPrimitive.content
                        if (inputType == "CHOICE") {
                            val optionId = gapField["options"]!!.jsonArray.first().jsonObject["gapOptionId"]!!.jsonPrimitive.int
                            """{"gapId":$gapId,"selectedOptionId":$optionId}"""
                        } else {
                            """{"gapId":$gapId,"text":"sample"}"""
                        }
                    }
                """{"gapAnswers":[$gapAnswersJson]}"""
            }
            else -> """{}"""
        }
    }
}
