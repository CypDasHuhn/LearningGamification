# gamification-api
## Building & Running

To build or run the project, use one of the following tasks:

| Task                                    | Description                                                          |
| -----------------------------------------|---------------------------------------------------------------------- |
| `./gradlew test`                        | Run the tests                                                        |
| `./gradlew build`                       | Build everything                                                     |
| `./gradlew buildFatJar`                 | Build an executable JAR of the server with all dependencies included |
| `./gradlew buildImage`                  | Build the docker image to use with the fat JAR                       |
| `./gradlew publishImageToLocalRegistry` | Publish the docker image locally                                     |
| `./gradlew run`                         | Run the server                                                       |
| `./gradlew runDocker`                   | Run using the local docker image                                     |

If the server starts successfully, you'll see the following output:

```
2024-12-04 14:32:45.584 [main] INFO  Application - Application started in 0.303 seconds.
2024-12-04 14:32:45.682 [main] INFO  Application - Responding at http://0.0.0.0:8080
```

## Simple Auth API

This project now includes a simple auth flow backed by a SQLite `users` table.

- `POST /auth/register` creates a user and returns a bearer token.
- `POST /auth/login` validates credentials and returns a bearer token.
- `GET /auth/me` returns the current user for a valid `Authorization: Bearer <token>` header.
- Auth uses Ktor's JWT `Authentication` plugin (`authenticate("auth-jwt")`).
- JWT secret is configured via `app.auth.jwt.secret` in `application.yaml`.

Example request body for register/login:

```json
{
  "userName": "testuser",
  "password": "strongpass123"
}
```

## Questions API

Authenticated endpoints for question delivery and answer submission:

- `GET /questions` returns questions with user completion status.
- `GET /questions?questionSetId=<id>` filters by question set.
- `POST /questions/{questionId}/submit` evaluates answers and stores completion in `user_question_progress` when correct.

`Authorization: Bearer <token>` is required for all `/questions` routes.

## Categories API

Authenticated endpoint for listing categories/themes:

- `GET /categories` returns all categories from the `theme` table.

## Themes & Quiz Navigation API

Authenticated endpoints for drilling down through quiz content:

- `GET /themes` returns all themes.
- `GET /themes/{themeId}/question-sets` returns all question sets linked to a theme.
- `GET /question-sets/{questionSetId}/questions` returns all questions in a question set.
- `GET /questions/{questionId}/answers` returns all possible answers for a question.
- `POST /questions/{questionId}/answer` submits a user answer.

## OpenAPI Docs

- OpenAPI spec: `GET /openapi`
- Swagger UI: `GET /swagger`

## Mock Seed Data

- Mock data seeding runs on startup when `app.seed.enabled=true` in `application.yaml`.
- Seed logic lives in `src/main/kotlin/db/Mock/SeedData.kt`.
- Current seed includes `demo-user` / `demo-pass-123` plus sample teams, themes, questions, and progress.

