package dev.gamification.backend

import io.ktor.client.request.*
import io.ktor.client.statement.bodyAsText
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ApplicationTest {

    @Test fun testRoot() = testApplication { application { module() } }

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
}
