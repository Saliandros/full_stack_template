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
  await requireUserSession(request);

  try {
    const users = await getAccessManagementUsers();

    return {
      users,
      connected: true,
      usersError: null,
    };
  } catch (error) {
    return {
      users: [],
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

  await requireUserSession(request);

  const fullName = formData.get("fullName")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const isAdmin = formData.get("isAdmin") === "on";
  const isStaff = formData.get("isStaff") === "on";

  try {
    if (intent === "create") {
      if (!fullName || !email) {
        return { ok: false as const, error: "Navn og e-mail er påkrævet." };
      }

      const user = await createAccessManagementUser({
        fullName,
        email,
        isAdmin,
        isStaff,
      });

      return { ok: true as const, mode: "create" as const, user };
    }

    if (intent === "update") {
      const userId = formData.get("userId")?.toString() ?? "";
      if (!userId || !fullName || !email) {
        return { ok: false as const, error: "Navn og e-mail er påkrævet." };
      }

      const user = await updateAccessManagementUser(userId, {
        fullName,
        email,
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
        error instanceof Error ? error.message : "Ukendt fejl ved gemning af bruger.",
    };
  }

  throw redirect("/");
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { connected, users, usersError } = loaderData;

  return <HomePage connected={connected} users={users} usersError={usersError} />;
}
