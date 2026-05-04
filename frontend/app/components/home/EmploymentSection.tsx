import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type {
  AccessManagementUser,
  Department,
  Employment,
  PersonnelGroup,
  ShiftTeam,
} from "../../services/apiService";
import { AnchoredPopup } from "./AnchoredPopup";
import { useAnchoredPopup } from "../../hooks/useAnchoredPopup";

type EmploymentSectionProps = {
  employments: Employment[];
  users: AccessManagementUser[];
  departments: Department[];
  personnelGroups: PersonnelGroup[];
  shiftTeams: ShiftTeam[];
  loadError: string | null;
};

type MutationResult =
  | {
      ok: true;
      mode: "employment-create" | "employment-update";
      employment: Employment;
    }
  | {
      ok: true;
      mode: "employment-delete";
      employmentId: string;
    }
  | {
      ok: false;
      error: string;
    };

type EmploymentFormState = {
  userId: string;
  departmentId: string;
  personnelGroupId: string;
  shiftTeamId: string;
  hoursPerWeek: string;
  startDate: string;
  endDate: string;
};

const emptyFormState: EmploymentFormState = {
  userId: "",
  departmentId: "",
  personnelGroupId: "",
  shiftTeamId: "",
  hoursPerWeek: "37",
  startDate: "",
  endDate: "",
};

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("da-DK").format(new Date(value));
}

export function EmploymentSection({
  employments,
  users,
  departments,
  personnelGroups,
  shiftTeams,
  loadError,
}: EmploymentSectionProps) {
  const fetcher = useFetcher<MutationResult>();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState(employments);
  const [editingEmploymentId, setEditingEmploymentId] = useState<string | null>(
    null,
  );
  const [formState, setFormState] = useState<EmploymentFormState>(emptyFormState);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const popupPosition = useAnchoredPopup({
    isOpen: isPopupOpen,
    anchorRef: buttonRef,
    popupRef,
    maxWidth: 620,
    onClose: closePopup,
  });

  const staffUsers = [...users]
    .filter((user) => user.isStaff)
    .sort((left, right) =>
      `${left.firstName} ${left.lastName}`.localeCompare(
        `${right.firstName} ${right.lastName}`,
        "da-DK",
      ),
    );

  useEffect(() => {
    setRows(employments);
  }, [employments]);

  useEffect(() => {
    const result = fetcher.data;

    if (!result?.ok) {
      return;
    }

    if (result.mode === "employment-delete") {
      setRows((currentRows) =>
        currentRows.filter((employment) => employment.id !== result.employmentId),
      );
      closePopup();
      return;
    }

    setRows((currentRows) => {
      const otherRows = currentRows.filter(
        (employment) => employment.id !== result.employment.id,
      );

      return [...otherRows, result.employment].sort((left, right) => {
        const nameCompare = left.userName.localeCompare(right.userName, "da-DK");
        if (nameCompare !== 0) {
          return nameCompare;
        }

        return left.startDate.localeCompare(right.startDate);
      });
    });

    closePopup();
  }, [fetcher.data]);

  const fetcherError =
    fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;
  const errorMessage = loadError || fetcherError;
  const isSubmitting = fetcher.state === "submitting" && !fetcherError;
  const isEditing = editingEmploymentId !== null;

  function openCreatePopup() {
    setEditingEmploymentId(null);
    setFormState(emptyFormState);
    setIsPopupOpen(true);
  }

  function startEdit(employment: Employment) {
    setEditingEmploymentId(employment.id);
    setFormState({
      userId: employment.userId,
      departmentId: employment.departmentId,
      personnelGroupId: employment.personnelGroupId,
      shiftTeamId: employment.shiftTeamId,
      hoursPerWeek: employment.hoursPerWeek.toString(),
      startDate: toDateInputValue(employment.startDate),
      endDate: toDateInputValue(employment.endDate),
    });
    setIsPopupOpen(true);
  }

  function closePopup() {
    setEditingEmploymentId(null);
    setFormState(emptyFormState);
    setIsPopupOpen(false);
  }

  function handleDelete(employmentId: string) {
    if (isSubmitting) {
      return;
    }

    const formData = new FormData();
    formData.set("intent", "employment-delete");
    formData.set("employmentId", employmentId);

    fetcher.submit(formData, { method: "post" });
  }

  return (
    <>
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Ansættelser</h2>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {rows.length} ansættelser
            </span>

            <button
              ref={buttonRef}
              type="button"
              onClick={openCreatePopup}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Tilføj ansættelse
            </button>
          </div>
        </div>

        {errorMessage && !isPopupOpen ? (
          <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Person</th>
                <th className="px-5 py-4">Afsnit</th>
                <th className="px-5 py-4">Personalegruppe</th>
                <th className="px-5 py-4">Vagtlag</th>
                <th className="px-5 py-4">Timer pr. uge</th>
                <th className="px-5 py-4">Periode</th>
                <th className="px-5 py-4 text-right">Handlinger</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={7}>
                    Ingen ansættelser endnu.
                  </td>
                </tr>
              ) : (
                rows.map((employment) => (
                  <tr key={employment.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {employment.userName}
                    </td>
                    <td className="px-5 py-4">{employment.departmentName}</td>
                    <td className="px-5 py-4">
                      {employment.personnelGroupName}
                    </td>
                    <td className="px-5 py-4">{employment.shiftTeamName}</td>
                    <td className="px-5 py-4">{employment.hoursPerWeek}</td>
                    <td className="px-5 py-4">
                      {formatDate(employment.startDate)} -{" "}
                      {formatDate(employment.endDate)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(employment)}
                          disabled={isSubmitting}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          Redigér
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(employment.id)}
                          disabled={isSubmitting}
                          className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
                        >
                          Slet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AnchoredPopup
        isOpen={isPopupOpen}
        popupRef={popupRef}
        position={popupPosition}
        title={isEditing ? "Redigér ansættelse" : "Tilføj ansættelse"}
        description="Vælg person, afsnit, personalegruppe, vagtlag og periode."
        onClose={closePopup}
        isBusy={isSubmitting}
      >
        <fetcher.Form
          method="post"
          autoComplete="off"
          className="relative mt-5 space-y-4"
        >
          <input
            type="hidden"
            name="intent"
            value={isEditing ? "employment-update" : "employment-create"}
          />
          {editingEmploymentId ? (
            <input type="hidden" name="employmentId" value={editingEmploymentId} />
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Person
            </span>
            <select
              name="employmentUserId"
              required
              value={formState.userId}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  userId: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            >
              <option value="">Vælg person</option>
              {staffUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Afsnit
              </span>
              <select
                name="employmentDepartmentId"
                required
                value={formState.departmentId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    departmentId: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              >
                <option value="">Vælg afsnit</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Personalegruppe
              </span>
              <select
                name="employmentPersonnelGroupId"
                required
                value={formState.personnelGroupId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    personnelGroupId: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              >
                <option value="">Vælg personalegruppe</option>
                {personnelGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Vagtlag
              </span>
              <select
                name="employmentShiftTeamId"
                required
                value={formState.shiftTeamId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    shiftTeamId: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              >
                <option value="">Vælg vagtlag</option>
                {shiftTeams.map((shiftTeam) => (
                  <option key={shiftTeam.id} value={shiftTeam.id}>
                    {shiftTeam.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Timer pr. uge
              </span>
              <input
                name="hoursPerWeek"
                type="number"
                required
                min={0}
                max={37}
                step={1}
                value={formState.hoursPerWeek}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    hoursPerWeek: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Startdato
              </span>
              <input
                name="startDate"
                type="date"
                required
                value={formState.startDate}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Slutdato
              </span>
              <input
                name="endDate"
                type="date"
                required
                value={formState.endDate}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting
                ? "Gemmer..."
                : isEditing
                  ? "Gem ændringer"
                  : "Tilføj ansættelse"}
            </button>

            <button
              type="button"
              onClick={closePopup}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Annullér
            </button>
          </div>
        </fetcher.Form>
      </AnchoredPopup>
    </>
  );
}
