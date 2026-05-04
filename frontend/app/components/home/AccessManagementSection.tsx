import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFetcher } from "react-router";
import type { AccessManagementUser } from "../../services/apiService";

type AccessManagementSectionProps = {
  users: AccessManagementUser[];
  loadError: string | null;
  currentUserIsAdmin: boolean;
};

type MutationResult =
  | {
      ok: true;
      mode: "create" | "update";
      user: AccessManagementUser;
    }
  | {
      ok: true;
      mode: "delete";
      userId: string;
    }
  | {
      ok: false;
      error: string;
    };

type UserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isStaff: boolean;
};

type PopupPosition = {
  top: number;
  left: number;
  width: number;
};

const emptyFormState: UserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  isAdmin: false,
  isStaff: true,
};

export function AccessManagementSection({
  users,
  loadError,
  currentUserIsAdmin,
}: AccessManagementSectionProps) {
  const fetcher = useFetcher<MutationResult>();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState(users);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserFormState>(emptyFormState);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);

  useEffect(() => {
    setRows(users);
  }, [users]);

  useEffect(() => {
    const result = fetcher.data;

    if (fetcher.state !== "idle" || !result?.ok) {
      return;
    }

    if (result.mode === "delete") {
      setRows((currentRows) =>
        currentRows.filter((user) => user.id !== result.userId),
      );
    } else {
      setRows((currentRows) => {
        const otherRows = currentRows.filter((user) => user.id !== result.user.id);

        return [...otherRows, result.user].sort((left, right) =>
          `${left.firstName} ${left.lastName}`.localeCompare(
            `${right.firstName} ${right.lastName}`,
            "da-DK",
          ),
        );
      });
    }

    closePopup();
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    if (!isPopupOpen) {
      return;
    }

    function updatePopupPosition() {
      const button = buttonRef.current;
      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const viewportPadding = 16;
      const preferredWidth = Math.min(520, window.innerWidth - viewportPadding * 2);
      const left = Math.min(
        rect.right - preferredWidth,
        window.innerWidth - preferredWidth - viewportPadding,
      );

      setPopupPosition({
        top: rect.bottom + 12,
        left: Math.max(viewportPadding, left),
        width: preferredWidth,
      });
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (popupRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      closePopup();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePopup();
      }
    }

    updatePopupPosition();
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPopupOpen]);

  const errorMessage =
    loadError ||
    (fetcher.data && !fetcher.data.ok ? fetcher.data.error : null);
  const isSubmitting = fetcher.state !== "idle";
  const isEditing = editingUserId !== null;
  const nameFieldsAreReadOnly = isEditing && !currentUserIsAdmin;

  function openCreatePopup() {
    setEditingUserId(null);
    setFormState(emptyFormState);
    setIsPopupOpen(true);
  }

  function startEdit(user: AccessManagementUser) {
    setEditingUserId(user.id);
    setFormState({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      isAdmin: user.isAdmin,
      isStaff: user.isStaff,
    });
    setIsPopupOpen(true);
  }

  function closePopup() {
    setEditingUserId(null);
    setFormState(emptyFormState);
    setIsPopupOpen(false);
    setPopupPosition(null);
  }

  function handleDelete(userId: string) {
    if (isSubmitting) {
      return;
    }

    const formData = new FormData();
    formData.set("intent", "delete");
    formData.set("userId", userId);

    fetcher.submit(formData, { method: "post" });
  }

  const popup =
    isPopupOpen && popupPosition
      ? createPortal(
          <div
            ref={popupRef}
            className="fixed z-[100] rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
            style={{
              top: popupPosition.top,
              left: popupPosition.left,
              width: popupPosition.width,
            }}
          >
            <div className="absolute -top-2 right-8 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {isEditing ? "Redigér bruger" : "Tilføj bruger"}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Fornavn, efternavn, e-mail, adgangskode og roller.
                </p>
              </div>

              <button
                type="button"
                onClick={closePopup}
                disabled={isSubmitting}
                className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed"
              >
                Luk
              </button>
            </div>

            <fetcher.Form method="post" className="relative mt-5 space-y-4">
              <input
                type="hidden"
                name="intent"
                value={isEditing ? "update" : "create"}
              />
              {editingUserId ? (
                <input type="hidden" name="userId" value={editingUserId} />
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Fornavn
                  </span>
                  <input
                    name="firstName"
                    required
                    readOnly={nameFieldsAreReadOnly}
                    aria-readonly={nameFieldsAreReadOnly}
                    value={formState.firstName}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                      nameFieldsAreReadOnly
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                        : "border-slate-300 bg-white text-slate-900 focus:border-amber-500"
                    }`}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Efternavn
                  </span>
                  <input
                    name="lastName"
                    required
                    readOnly={nameFieldsAreReadOnly}
                    aria-readonly={nameFieldsAreReadOnly}
                    value={formState.lastName}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                      nameFieldsAreReadOnly
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                        : "border-slate-300 bg-white text-slate-900 focus:border-amber-500"
                    }`}
                  />
                </label>
              </div>

              {nameFieldsAreReadOnly ? (
                <p className="text-xs text-slate-500">
                  Kun brugere med admin-rettigheder kan ændre navn.
                </p>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  E-mail
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="block text-sm font-medium text-slate-700">
                    Adgangskode
                  </span>
                  <span className="text-xs text-slate-500">
                    {isEditing ? "Udfyld kun for at ændre" : "Påkrævet"}
                  </span>
                </div>
                <input
                  name="password"
                  type="password"
                  required={!isEditing}
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  name="isAdmin"
                  type="checkbox"
                  checked={formState.isAdmin}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      isAdmin: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                Rolle: Admin
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  name="isStaff"
                  type="checkbox"
                  checked={formState.isStaff}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      isStaff: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                Rolle: Personale
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
                      : "Tilføj bruger"}
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
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Brugere</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {rows.length} brugere
            </span>

            <button
              ref={buttonRef}
              type="button"
              onClick={openCreatePopup}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Tilføj bruger
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
                <th className="px-5 py-4">E-mail</th>
                <th className="px-5 py-4">Admin</th>
                <th className="px-5 py-4">Personale</th>
                <th className="px-5 py-4 text-right">Handlinger</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={5}>
                    Ingen brugere endnu.
                  </td>
                </tr>
              ) : (
                rows.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-5 py-4">{user.email}</td>
                    <td className="px-5 py-4">{user.isAdmin ? "Ja" : "Nej"}</td>
                    <td className="px-5 py-4">{user.isStaff ? "Ja" : "Nej"}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(user)}
                          disabled={isSubmitting}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          Redigér
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
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

      {popup}
    </>
  );
}
