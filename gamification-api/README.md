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

Example request body for register/login:

```json
{
  "userName": "testuser",
  "password": "strongpass123"
}
```

## OpenAPI Docs

- OpenAPI spec: `GET /openapi`
- Swagger UI: `GET /swagger`

