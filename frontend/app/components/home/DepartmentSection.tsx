import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { Department } from "../../services/apiService";
import { useAnchoredPopup } from "../../hooks/useAnchoredPopup";
import { AnchoredPopup } from "./AnchoredPopup";

type DepartmentSectionProps = {
  departments: Department[];
  loadError: string | null;
};

type MutationResult =
  | {
      ok: true;
      mode: "department-create" | "department-update";
      department: Department;
    }
  | {
      ok: true;
      mode: "department-delete";
      departmentId: string;
    }
  | {
      ok: false;
      error: string;
    };

type DepartmentFormState = {
  name: string;
  departmentLabel: string;
};

const emptyFormState: DepartmentFormState = {
  name: "",
  departmentLabel: "",
};

export function DepartmentSection({
  departments,
  loadError,
}: DepartmentSectionProps) {
  const fetcher = useFetcher<MutationResult>();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState(departments);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(
    null,
  );
  const [formState, setFormState] = useState<DepartmentFormState>(emptyFormState);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const popupPosition = useAnchoredPopup({
    isOpen: isPopupOpen,
    anchorRef: buttonRef,
    popupRef,
    maxWidth: 420,
    onClose: closePopup,
  });

  useEffect(() => {
    setRows(departments);
  }, [departments]);

  useEffect(() => {
    const result = fetcher.data;

    if (!result?.ok) {
      return;
    }

    if (result.mode === "department-delete") {
      setRows((currentRows) =>
        currentRows.filter((department) => department.id !== result.departmentId),
      );
      closePopup();
      return;
    }

    setRows((currentRows) => {
      const otherRows = currentRows.filter(
        (department) => department.id !== result.department.id,
      );

      return [...otherRows, result.department].sort((left, right) =>
        left.name.localeCompare(right.name, "da-DK"),
      );
    });

    closePopup();
  }, [fetcher.data]);

  const fetcherError =
    fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;
  const errorMessage = loadError || fetcherError;
  const isSubmitting = fetcher.state === "submitting" && !fetcherError;
  const isEditing = editingDepartmentId !== null;

  function openCreatePopup() {
    setEditingDepartmentId(null);
    setFormState(emptyFormState);
    setIsPopupOpen(true);
  }

  function startEdit(department: Department) {
    setEditingDepartmentId(department.id);
    setFormState({
      name: department.name,
      departmentLabel: department.color,
    });
    setIsPopupOpen(true);
  }

  function closePopup() {
    setEditingDepartmentId(null);
    setFormState(emptyFormState);
    setIsPopupOpen(false);
  }

  function handleDelete(departmentId: string) {
    if (isSubmitting) {
      return;
    }

    const formData = new FormData();
    formData.set("intent", "department-delete");
    formData.set("departmentId", departmentId);

    fetcher.submit(formData, { method: "post" });
  }

  return (
    <>
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Afsnit</h2>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {rows.length} afsnit
            </span>

            <button
              ref={buttonRef}
              type="button"
              onClick={openCreatePopup}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Tilføj afsnit
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
                <th className="px-5 py-4">Navn</th>
                <th className="px-5 py-4">Afdeling</th>
                <th className="px-5 py-4 text-right">Handlinger</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={3}>
                    Ingen afsnit endnu.
                  </td>
                </tr>
              ) : (
                rows.map((department) => (
                  <tr key={department.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {department.name}
                    </td>
                    <td className="px-5 py-4">{department.color}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(department)}
                          disabled={isSubmitting}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          Redigér
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(department.id)}
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
        title={isEditing ? "Redigér afsnit" : "Tilføj afsnit"}
        description="Navn og afdeling."
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
            value={isEditing ? "department-update" : "department-create"}
          />
          {editingDepartmentId ? (
            <input
              type="hidden"
              name="departmentId"
              value={editingDepartmentId}
            />
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Navn
            </span>
            <input
              name="name"
              required
              autoComplete="off"
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Afdeling
            </span>
            <input
              name="color"
              required
              autoComplete="off"
              value={formState.departmentLabel}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  departmentLabel: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              placeholder="Fx Rød Stue eller Grøn Stue"
            />
          </label>

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
                  : "Tilføj afsnit"}
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
