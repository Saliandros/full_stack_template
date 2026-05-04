import { useMemo, useState } from "react";
import type { PersonnelRow } from "../../services/apiService";

type PeriodOverviewSectionProps = {
  personnel: PersonnelRow[];
  loadError: string | null;
};

type GroupedPeriods = {
  personName: string;
  periods: PersonnelRow[];
};

function toDateOnly(value: string) {
  return value.slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("da-DK").format(new Date(value));
}

function isActiveToday(row: PersonnelRow) {
  const today = new Date().toISOString().slice(0, 10);
  const start = toDateOnly(row.startDate);
  const end = toDateOnly(row.endDate);
  return start <= today && end >= today;
}

export function PeriodOverviewSection({
  personnel,
  loadError,
}: PeriodOverviewSectionProps) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const uniqueDepartments = useMemo(
    () =>
      [...new Set(personnel.map((row) => row.departmentName))]
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, "da-DK")),
    [personnel],
  );

  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("da-DK");

    return personnel
      .filter((row) => {
        if (departmentFilter && row.departmentName !== departmentFilter) {
          return false;
        }

        if (showOnlyActive && !isActiveToday(row)) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const haystack = [
          row.name,
          row.departmentName,
          row.personnelGroupName,
          row.shiftTeamName,
        ]
          .join(" ")
          .toLocaleLowerCase("da-DK");

        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        const byName = left.name.localeCompare(right.name, "da-DK");
        if (byName !== 0) {
          return byName;
        }

        return left.startDate.localeCompare(right.startDate);
      });
  }, [departmentFilter, personnel, search, showOnlyActive]);

  const groupedRows = useMemo(() => {
    const grouped = new Map<string, PersonnelRow[]>();

    for (const row of visibleRows) {
      const rows = grouped.get(row.name) ?? [];
      rows.push(row);
      grouped.set(row.name, rows);
    }

    return [...grouped.entries()].map(([personName, periods]) => ({
      personName,
      periods,
    })) as GroupedPeriods[];
  }, [visibleRows]);

  const totalPeriods = visibleRows.length;

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Periodeoversigt</h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {groupedRows.length} personer / {totalPeriods} perioder
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Søg
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
              placeholder="Navn, afsnit, personalegruppe eller vagtlag"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Afsnit
            </span>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            >
              <option value="">Alle</option>
              {uniqueDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-end">
            <span className="flex w-full items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-[0.85rem] text-sm text-slate-800">
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={(event) => setShowOnlyActive(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              Kun aktive i dag
            </span>
          </label>
        </div>
      </div>

      {loadError ? (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      <div className="max-h-[62vh] space-y-4 overflow-y-auto px-5 py-5">
        {groupedRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
            Ingen perioder matcher dine filtre.
          </div>
        ) : (
          groupedRows.map((group) => (
            <article
              key={group.personName}
              className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4"
            >
              <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-base font-semibold text-slate-950">{group.personName}</h3>
                <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {group.periods.length} perioder
                </span>
              </header>

              <ol className="space-y-3">
                {group.periods.map((period, index) => (
                  <li
                    key={`${group.personName}-${period.startDate}-${period.endDate}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        {period.departmentName} · {period.personnelGroupName}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Vagtlag: {period.shiftTeamName} · Timer/uge: {period.hoursPerWeek}
                    </p>
                  </li>
                ))}
              </ol>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
