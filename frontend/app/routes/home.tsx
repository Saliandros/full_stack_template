import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { HomePage } from "../pages/home/HomePage";
import { getDepartments } from "../services/apiService";
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
    const departments = await getDepartments();

    return {
      departments,
      connected: true,
      error: null,
    };
  } catch (error) {
    return {
      departments: [],
      connected: false,
      error:
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

  throw redirect("/");
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { connected } = loaderData;

  return <HomePage connected={connected} />;
}
