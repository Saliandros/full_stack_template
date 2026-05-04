import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { PersonnelGroup } from "../../services/apiService";
import { AnchoredPopup } from "./AnchoredPopup";
import { useAnchoredPopup } from "../../hooks/useAnchoredPopup";

type PersonnelGroupSectionProps = {
  groups: PersonnelGroup[];
  loadError: string | null;
};

type MutationResult =
  | {
      ok: true;
      mode: "personnel-group-create" | "personnel-group-update";
      group: PersonnelGroup;
    }
  | {
      ok: true;
      mode: "personnel-group-delete";
      groupId: string;
    }
  | {
      ok: false;
      error: string;
    };

type PersonnelGroupFormState = {
  name: string;
};

const emptyFormState: PersonnelGroupFormState = {
  name: "",
};

export function PersonnelGroupSection({
  groups,
  loadError,
}: PersonnelGroupSectionProps) {
  const fetcher = useFetcher<MutationResult>();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState(groups);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [formState, setFormState] = useState<PersonnelGroupFormState>(emptyFormState);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const popupPosition = useAnchoredPopup({
    isOpen: isPopupOpen,
    anchorRef: buttonRef,
    popupRef,
    maxWidth: 420,
    onClose: closePopup,
  });

  useEffect(() => {
    setRows(groups);
  }, [groups]);

  useEffect(() => {
    const result = fetcher.data;

    if (!result?.ok) {
      return;
    }

    if (result.mode === "personnel-group-delete") {
      setRows((currentRows) =>
        currentRows.filter((group) => group.id !== result.groupId),
      );
      closePopup();
      return;
    }

    setRows((currentRows) => {
      const otherRows = currentRows.filter((group) => group.id !== result.group.id);

      return [...otherRows, result.group].sort((left, right) =>
        left.name.localeCompare(right.name, "da-DK"),
      );
    });

    closePopup();
  }, [fetcher.data]);

  const fetcherError =
    fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;
  const errorMessage = loadError || fetcherError;
  const isSubmitting = fetcher.state === "submitting" && !fetcherError;
  const isEditing = editingGroupId !== null;

  function openCreatePopup() {
    setEditingGroupId(null);
    setFormState(emptyFormState);
    setIsPopupOpen(true);
  }

  function startEdit(group: PersonnelGroup) {
    setEditingGroupId(group.id);
    setFormState({ name: group.name });
    setIsPopupOpen(true);
  }

  function closePopup() {
    setEditingGroupId(null);
    setFormState(emptyFormState);
    setIsPopupOpen(false);
  }

  function handleDelete(groupId: string) {
    if (isSubmitting) {
      return;
    }

    const formData = new FormData();
    formData.set("intent", "personnel-group-delete");
    formData.set("groupId", groupId);

    fetcher.submit(formData, { method: "post" });
  }

  return (
    <>
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-950">
            Personalegrupper
          </h2>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {rows.length} personalegrupper
            </span>

            <button
              ref={buttonRef}
              type="button"
              onClick={openCreatePopup}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Tilføj personalegruppe
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
                <th className="px-5 py-4 text-right">Handlinger</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={2}>
                    Ingen personalegrupper endnu.
                  </td>
                </tr>
              ) : (
                rows.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {group.name}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(group)}
                          disabled={isSubmitting}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          Redigér
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(group.id)}
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
        title={isEditing ? "Redigér personalegruppe" : "Tilføj personalegruppe"}
        description="Navn på personalegruppen."
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
            value={
              isEditing
                ? "personnel-group-update"
                : "personnel-group-create"
            }
          />
          {editingGroupId ? (
            <input type="hidden" name="groupId" value={editingGroupId} />
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
                setFormState({
                  name: event.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              placeholder="Fx Overlæge"
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
                  : "Tilføj personalegruppe"}
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
