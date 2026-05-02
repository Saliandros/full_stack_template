import { createCookieSessionStorage, redirect } from "react-router";

type AuthSessionData = {
  userId: string;
};

const sessionStorage = createCookieSessionStorage<AuthSessionData>({
  cookie: {
    name: "__vagtplan_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
  },
});

export async function getSession(cookieHeader: string | null) {
  return sessionStorage.getSession(cookieHeader);
}

export async function requireUserSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    throw redirect("/login");
  }

  return { session, userId };
}

export async function createUserSession(userId: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function destroyUserSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
