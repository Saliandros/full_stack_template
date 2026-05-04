import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { HomePage } from "../pages/home/HomePage";
import {
  createAccessManagementUser,
  createDepartment,
  createEmployment,
  createPersonnelGroup,
  createShiftTeam,
  deleteAccessManagementUser,
  deleteDepartment,
  deleteEmployment,
  deletePersonnelGroup,
  deleteShiftTeam,
  getAccessManagementUsers,
  getDepartments,
  getEmployments,
  getPersonnel,
  getPersonnelGroups,
  getShiftTeams,
  updateAccessManagementUser,
  updateDepartment,
  updateEmployment,
  updatePersonnelGroup,
  updateShiftTeam,
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

function toErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof TypeError) {
    const msg = error.message;
    if (
      msg === "fetch failed" ||
      msg === "Failed to fetch" ||
      msg === "Load failed"
    ) {
      return "Kunne ikke oprette forbindelse til serveren. Tjek din internetforbindelse og prøv igen.";
    }
  }
  return error instanceof Error ? error.message : fallbackMessage;
}

export async function loader({ request }: Route.LoaderArgs) {
  const { userId } = await requireUserSession(request);

  const [
    usersResult,
    departmentsResult,
    personnelGroupsResult,
    shiftTeamsResult,
    employmentsResult,
    personnelResult,
  ] = await Promise.allSettled([
    getAccessManagementUsers(),
    getDepartments(),
    getPersonnelGroups(),
    getShiftTeams(),
    getEmployments(),
    getPersonnel(),
  ]);

  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const departments =
    departmentsResult.status === "fulfilled" ? departmentsResult.value : [];
  const personnelGroups =
    personnelGroupsResult.status === "fulfilled"
      ? personnelGroupsResult.value
      : [];
  const shiftTeams =
    shiftTeamsResult.status === "fulfilled" ? shiftTeamsResult.value : [];
  const employments =
    employmentsResult.status === "fulfilled" ? employmentsResult.value : [];
  const personnel =
    personnelResult.status === "fulfilled" ? personnelResult.value : [];

  const currentUserIsAdmin =
    users.find((user) => user.id === userId)?.isAdmin ?? false;

  return {
    users,
    departments,
    personnelGroups,
    shiftTeams,
    employments,
    personnel,
    currentUserIsAdmin,
    connected:
      usersResult.status === "fulfilled" &&
      departmentsResult.status === "fulfilled" &&
      personnelGroupsResult.status === "fulfilled" &&
      shiftTeamsResult.status === "fulfilled" &&
      employmentsResult.status === "fulfilled" &&
      personnelResult.status === "fulfilled",
    usersError:
      usersResult.status === "rejected"
        ? toErrorMessage(usersResult.reason, "Ukendt fejl ved hentning af brugere.")
        : null,
    departmentsError:
      departmentsResult.status === "rejected"
        ? toErrorMessage(
            departmentsResult.reason,
            "Ukendt fejl ved hentning af afsnit.",
          )
        : null,
    personnelGroupsError:
      personnelGroupsResult.status === "rejected"
        ? toErrorMessage(
            personnelGroupsResult.reason,
            "Ukendt fejl ved hentning af personalegrupper.",
          )
        : null,
    shiftTeamsError:
      shiftTeamsResult.status === "rejected"
        ? toErrorMessage(
            shiftTeamsResult.reason,
            "Ukendt fejl ved hentning af vagtlag.",
          )
        : null,
    employmentsError:
      employmentsResult.status === "rejected"
        ? toErrorMessage(
            employmentsResult.reason,
            "Ukendt fejl ved hentning af ansættelser.",
          )
        : null,
    personnelError:
      personnelResult.status === "rejected"
        ? toErrorMessage(
            personnelResult.reason,
            "Ukendt fejl ved hentning af personale.",
          )
        : null,
  };
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
  const departmentName = formData.get("name")?.toString().trim() ?? "";
  const departmentColor = formData.get("color")?.toString().trim() ?? "";
  const personnelGroupName = formData.get("name")?.toString().trim() ?? "";
  const shiftTeamName = formData.get("name")?.toString().trim() ?? "";
  const employmentUserId =
    formData.get("employmentUserId")?.toString().trim() ?? "";
  const employmentDepartmentId =
    formData.get("employmentDepartmentId")?.toString().trim() ?? "";
  const employmentPersonnelGroupId =
    formData.get("employmentPersonnelGroupId")?.toString().trim() ?? "";
  const employmentShiftTeamId =
    formData.get("employmentShiftTeamId")?.toString().trim() ?? "";
  const hoursPerWeekValue =
    formData.get("hoursPerWeek")?.toString().trim() ?? "";
  const startDate = formData.get("startDate")?.toString().trim() ?? "";
  const endDate = formData.get("endDate")?.toString().trim() ?? "";

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

    if (intent === "department-create") {
      if (!departmentName || !departmentColor) {
        return {
          ok: false as const,
          error: "Navn og afdeling er påkrævet.",
        };
      }

      const department = await createDepartment({
        name: departmentName,
        color: departmentColor,
      });

      return {
        ok: true as const,
        mode: "department-create" as const,
        department,
      };
    }

    if (intent === "department-update") {
      const departmentId = formData.get("departmentId")?.toString() ?? "";
      if (!departmentId || !departmentName || !departmentColor) {
        return {
          ok: false as const,
          error: "Navn og afdeling er påkrævet.",
        };
      }

      const department = await updateDepartment(departmentId, {
        name: departmentName,
        color: departmentColor,
      });

      return {
        ok: true as const,
        mode: "department-update" as const,
        department,
      };
    }

    if (intent === "department-delete") {
      const departmentId = formData.get("departmentId")?.toString() ?? "";
      if (!departmentId) {
        return { ok: false as const, error: "Afsnits-ID mangler." };
      }

      await deleteDepartment(departmentId);

      return {
        ok: true as const,
        mode: "department-delete" as const,
        departmentId,
      };
    }

    if (intent === "personnel-group-create") {
      if (!personnelGroupName) {
        return { ok: false as const, error: "Navn er påkrævet." };
      }

      const group = await createPersonnelGroup({
        name: personnelGroupName,
      });

      return {
        ok: true as const,
        mode: "personnel-group-create" as const,
        group,
      };
    }

    if (intent === "personnel-group-update") {
      const groupId = formData.get("groupId")?.toString() ?? "";
      if (!groupId || !personnelGroupName) {
        return { ok: false as const, error: "Navn er påkrævet." };
      }

      const group = await updatePersonnelGroup(groupId, {
        name: personnelGroupName,
      });

      return {
        ok: true as const,
        mode: "personnel-group-update" as const,
        group,
      };
    }

    if (intent === "personnel-group-delete") {
      const groupId = formData.get("groupId")?.toString() ?? "";
      if (!groupId) {
        return { ok: false as const, error: "Personalegruppe-ID mangler." };
      }

      await deletePersonnelGroup(groupId);

      return {
        ok: true as const,
        mode: "personnel-group-delete" as const,
        groupId,
      };
    }

    if (intent === "shift-team-create") {
      if (!shiftTeamName) {
        return { ok: false as const, error: "Navn er påkrævet." };
      }

      const shiftTeam = await createShiftTeam({
        name: shiftTeamName,
      });

      return {
        ok: true as const,
        mode: "shift-team-create" as const,
        shiftTeam,
      };
    }

    if (intent === "shift-team-update") {
      const shiftTeamId = formData.get("shiftTeamId")?.toString() ?? "";
      if (!shiftTeamId || !shiftTeamName) {
        return { ok: false as const, error: "Navn er påkrævet." };
      }

      const shiftTeam = await updateShiftTeam(shiftTeamId, {
        name: shiftTeamName,
      });

      return {
        ok: true as const,
        mode: "shift-team-update" as const,
        shiftTeam,
      };
    }

    if (intent === "shift-team-delete") {
      const shiftTeamId = formData.get("shiftTeamId")?.toString() ?? "";
      if (!shiftTeamId) {
        return { ok: false as const, error: "Vagtlags-ID mangler." };
      }

      await deleteShiftTeam(shiftTeamId);

      return {
        ok: true as const,
        mode: "shift-team-delete" as const,
        shiftTeamId,
      };
    }

    if (intent === "employment-create") {
      if (
        !employmentUserId ||
        !employmentDepartmentId ||
        !employmentPersonnelGroupId ||
        !employmentShiftTeamId ||
        !hoursPerWeekValue ||
        !startDate ||
        !endDate
      ) {
        return {
          ok: false as const,
          error: "Alle felter skal udfyldes.",
        };
      }

      const employment = await createEmployment({
        userId: employmentUserId,
        departmentId: employmentDepartmentId,
        personnelGroupId: employmentPersonnelGroupId,
        shiftTeamId: employmentShiftTeamId,
        hoursPerWeek: Number(hoursPerWeekValue),
        startDate,
        endDate,
      });

      return {
        ok: true as const,
        mode: "employment-create" as const,
        employment,
      };
    }

    if (intent === "employment-update") {
      const employmentId = formData.get("employmentId")?.toString() ?? "";
      if (
        !employmentId ||
        !employmentUserId ||
        !employmentDepartmentId ||
        !employmentPersonnelGroupId ||
        !employmentShiftTeamId ||
        !hoursPerWeekValue ||
        !startDate ||
        !endDate
      ) {
        return {
          ok: false as const,
          error: "Alle felter skal udfyldes.",
        };
      }

      const employment = await updateEmployment(employmentId, {
        userId: employmentUserId,
        departmentId: employmentDepartmentId,
        personnelGroupId: employmentPersonnelGroupId,
        shiftTeamId: employmentShiftTeamId,
        hoursPerWeek: Number(hoursPerWeekValue),
        startDate,
        endDate,
      });

      return {
        ok: true as const,
        mode: "employment-update" as const,
        employment,
      };
    }

    if (intent === "employment-delete") {
      const employmentId = formData.get("employmentId")?.toString() ?? "";
      if (!employmentId) {
        return { ok: false as const, error: "Ansættelses-ID mangler." };
      }

      await deleteEmployment(employmentId);

      return {
        ok: true as const,
        mode: "employment-delete" as const,
        employmentId,
      };
    }
  } catch (error) {
    const isNetworkError =
      error instanceof TypeError &&
      (error.message === "fetch failed" || error.message === "Failed to fetch" || error.message === "Load failed");
    return {
      ok: false as const,
      error: isNetworkError
        ? "Kunne ikke oprette forbindelse til serveren. Tjek din internetforbindelse og prøv igen."
        : error instanceof Error
          ? error.message
          : "Ukendt fejl ved gemning.",
    };
  }

  throw redirect("/");
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    connected,
    users,
    usersError,
    departments,
    departmentsError,
    personnelGroups,
    personnelGroupsError,
    shiftTeams,
    shiftTeamsError,
    employments,
    employmentsError,
    personnel,
    personnelError,
    currentUserIsAdmin,
  } = loaderData;

  return (
    <HomePage
      connected={connected}
      users={users}
      usersError={usersError}
      departments={departments}
      departmentsError={departmentsError}
      personnelGroups={personnelGroups}
      personnelGroupsError={personnelGroupsError}
      shiftTeams={shiftTeams}
      shiftTeamsError={shiftTeamsError}
      employments={employments}
      employmentsError={employmentsError}
      personnel={personnel}
      personnelError={personnelError}
      currentUserIsAdmin={currentUserIsAdmin}
    />
  );
}
