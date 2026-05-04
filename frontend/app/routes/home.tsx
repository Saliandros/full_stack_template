import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { HomePage } from "../pages/home/HomePage";
import {
  createAccessManagementUser,
  deleteAccessManagementUser,
  getAccessManagementUsers,
  updateAccessManagementUser,
} from "../services/apiService";
import {
  destroyUserSession,
  requireUserSession,
} from "../services/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Vagtplan" },
    { name: "description", content: "Vagtplan frontend" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { userId } = await requireUserSession(request);

  try {
    const users = await getAccessManagementUsers();
    const currentUserIsAdmin =
      users.find((user) => user.id === userId)?.isAdmin ?? false;

    return {
      users,
      currentUserIsAdmin,
      connected: true,
      usersError: null,
    };
  } catch (error) {
    return {
      users: [],
      currentUserIsAdmin: false,
      connected: false,
      usersError:
        error instanceof Error
          ? error.message
          : "Ukendt fejl ved hentning af data.",
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    return destroyUserSession(request);
  }

  const { userId: currentUserId } = await requireUserSession(request);

  let firstName = formData.get("firstName")?.toString().trim() ?? "";
  let lastName = formData.get("lastName")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const isAdmin = formData.get("isAdmin") === "on";
  const isStaff = formData.get("isStaff") === "on";

  try {
    if (intent === "create") {
      if (!firstName || !lastName || !email || !password.trim()) {
        return {
          ok: false as const,
          error: "Fornavn, efternavn, e-mail og adgangskode er påkrævet.",
        };
      }

      const user = await createAccessManagementUser({
        firstName,
        lastName,
        email,
        password,
        isAdmin,
        isStaff,
      });

      return { ok: true as const, mode: "create" as const, user };
    }

    if (intent === "update") {
      const userId = formData.get("userId")?.toString() ?? "";
      if (!userId || !firstName || !lastName || !email) {
        return {
          ok: false as const,
          error: "Fornavn, efternavn og e-mail er påkrævet.",
        };
      }

      const users = await getAccessManagementUsers();
      const currentUserIsAdmin =
        users.find((user) => user.id === currentUserId)?.isAdmin ?? false;
      const existingUser = users.find((user) => user.id === userId);

      if (!existingUser) {
        return { ok: false as const, error: "Bruger blev ikke fundet." };
      }

      if (!currentUserIsAdmin) {
        firstName = existingUser.firstName;
        lastName = existingUser.lastName;
      }

      const user = await updateAccessManagementUser(userId, {
        firstName,
        lastName,
        email,
        password,
        isAdmin,
        isStaff,
      });

      return { ok: true as const, mode: "update" as const, user };
    }

    if (intent === "delete") {
      const userId = formData.get("userId")?.toString() ?? "";
      if (!userId) {
        return { ok: false as const, error: "Bruger-ID mangler." };
      }

      await deleteAccessManagementUser(userId);

      return { ok: true as const, mode: "delete" as const, userId };
    }
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Ukendt fejl ved gemning af bruger.",
    };
  }

  throw redirect("/");
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { connected, users, usersError, currentUserIsAdmin } = loaderData;

  return (
    <HomePage
      connected={connected}
      users={users}
      usersError={usersError}
      currentUserIsAdmin={currentUserIsAdmin}
    />
  );
}
