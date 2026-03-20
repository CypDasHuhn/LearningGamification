import { data, redirect } from "react-router";
import { fetchFunction } from "~/utils/fetch-function.server";
import { setCookieFunction } from "~/utils/set-cookie-function.server";

export const withRegisterData = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  return { request, formData };
};

export const withLoginData = withRegisterData;

type AuthIntent = "register" | "login";

type RouteArgs = {
  request: Request;
  formData: FormData;
};

async function routeByIntent(
  { request, formData }: RouteArgs,
  intent: AuthIntent,
) {
  const userNameRaw = formData.get("userName");
  const passwordRaw = formData.get("password");

  if (typeof userNameRaw !== "string" || userNameRaw.trim().length === 0) {
    return data(
      { success: false, error: "Benutzername ist erforderlich", intent },
      { status: 400 },
    );
  }
  if (typeof passwordRaw !== "string" || passwordRaw.length === 0) {
    return data(
      { success: false, error: "Passwort ist erforderlich", intent },
      { status: 400 },
    );
  }

  // Nur um die Hidden-Input-Intent-Quelle zu validieren (Sicherheitscheck).
  const intentFromForm = formData.get("intent");
  if (intentFromForm !== intent) {
    return data(
      {
        success: false,
        error: "Ungültige Anfrage",
        intent: String(intentFromForm ?? ""),
      },
      { status: 400 },
    );
  }

  try {
    const url = intent === "register" ? "/auth/register" : "/auth/login";
    const result = await fetchFunction({
      url,
      method: "POST",
      body: { userName: userNameRaw.trim(), password: passwordRaw },
      request,
    });
    const auth = result.response as {
      token: string;
      userId: number;
      userName: string;
    };

    // Server-seitige Cookies setzen -> keine Client-Race-Conditions.
    const headers = setCookieFunction({
      token: auth.token,
      userId: auth.userId,
      userName: auth.userName,
    });
    throw redirect("/chapter-selection", { headers });
  } catch (err) {
    // Redirect() wirft eine Response. Nicht abfangen, damit der Router navigieren kann.
    if (err instanceof Response) throw err;

    const errorMessage =
      err instanceof Error
        ? err.message
        : intent === "register"
          ? "Registrierung fehlgeschlagen"
          : "Anmeldung fehlgeschlagen";
    const status =
      typeof (err as any)?.status === "number" ? (err as any).status : 400;

    return data({ success: false, error: errorMessage, intent }, { status });
  }
}

export const routeByAuthIntent = async ({
  request,
  formData,
}: {
  request: Request;
  formData: FormData;
}) => {
  const intent = formData.get("intent");

  if (intent !== "register" && intent !== "login") {
    return data(
      {
        success: false,
        error: "Ungültige Anfrage",
        intent: String(intent ?? ""),
      },
      { status: 400 },
    );
  }

  return routeByIntent({ request, formData }, intent as AuthIntent);
};

export const routeByRegisterIntent = (args: RouteArgs) =>
  routeByIntent(args, "register");

export const routeByLoginIntent = (args: RouteArgs) => routeByIntent(args, "login");
