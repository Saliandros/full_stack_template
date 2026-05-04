import { useState } from "react";
import type { PersonnelRow } from "../../services/apiService";

type PersonnelSectionProps = {
  personnel: PersonnelRow[];
  loadError: string | null;
};

type SortKey =
  | "name"
  | "departmentName"
  | "personnelGroupName"
  | "shiftTeamName"
  | "hoursPerWeek";

type SortDirection = "asc" | "desc";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("da-DK").format(new Date(value));
}

export function PersonnelSection({
  personnel,
  loadError,
}: PersonnelSectionProps) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [personnelGroupFilter, setPersonnelGroupFilter] = useState("");
  const [shiftTeamFilter, setShiftTeamFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const uniqueDepartments = [...new Set(personnel.map((row) => row.departmentName))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "da-DK"));
  const uniquePersonnelGroups = [
    ...new Set(personnel.map((row) => row.personnelGroupName)),
  ]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "da-DK"));
  const uniqueShiftTeams = [...new Set(personnel.map((row) => row.shiftTeamName))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "da-DK"));

  const hasInvalidDateRange = Boolean(
    startDate && endDate && endDate < startDate,
  );

  const filteredRows = personnel
    .filter((row) => {
      if (hasInvalidDateRange) {
        return false;
      }

      const rowStart = row.startDate.slice(0, 10);
      const rowEnd = row.endDate.slice(0, 10);

      if (startDate && rowEnd < startDate) {
        return false;
      }

      if (endDate && rowStart > endDate) {
        return false;
      }

      if (departmentFilter && row.departmentName !== departmentFilter) {
        return false;
      }

      if (
        personnelGroupFilter &&
        row.personnelGroupName !== personnelGroupFilter
      ) {
        return false;
      }

      if (shiftTeamFilter && row.shiftTeamName !== shiftTeamFilter) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const normalizedSearch = search.trim().toLocaleLowerCase("da-DK");
      const haystack = [
        row.name,
        row.departmentName,
        row.personnelGroupName,
        row.shiftTeamName,
        row.hoursPerWeek.toString(),
      ]
        .join(" ")
        .toLocaleLowerCase("da-DK");

      return haystack.includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (sortKey === "hoursPerWeek") {
        const difference = left.hoursPerWeek - right.hoursPerWeek;
        return sortDirection === "asc" ? difference : difference * -1;
      }

      const difference = left[sortKey].localeCompare(right[sortKey], "da-DK");
      return sortDirection === "asc" ? difference : difference * -1;
    });

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Personale</h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {filteredRows.length} aktive rækker
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
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
              Startdato
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Slutdato
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
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

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Personalegruppe
            </span>
            <select
              value={personnelGroupFilter}
              onChange={(event) => setPersonnelGroupFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            >
              <option value="">Alle</option>
              {uniquePersonnelGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Vagtlag
            </span>
            <select
              value={shiftTeamFilter}
              onChange={(event) => setShiftTeamFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            >
              <option value="">Alle</option>
              {uniqueShiftTeams.map((shiftTeam) => (
                <option key={shiftTeam} value={shiftTeam}>
                  {shiftTeam}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Sortér efter
            </span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            >
              <option value="name">Navn</option>
              <option value="departmentName">Afsnit</option>
              <option value="personnelGroupName">Personalegruppe</option>
              <option value="shiftTeamName">Vagtlag</option>
              <option value="hoursPerWeek">Timer pr. uge</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Retning
            </span>
            <select
              value={sortDirection}
              onChange={(event) =>
                setSortDirection(event.target.value as SortDirection)
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
            >
              <option value="asc">Stigende</option>
              <option value="desc">Faldende</option>
            </select>
          </label>
        </div>
      </div>

      {loadError ? (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      {hasInvalidDateRange ? (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
          Slutdato skal være efter eller lig med startdato.
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Navn</th>
              <th className="px-5 py-4">Afsnit</th>
              <th className="px-5 py-4">Personalegruppe</th>
              <th className="px-5 py-4">Vagtlag</th>
              <th className="px-5 py-4">Timer pr. uge</th>
              <th className="px-5 py-4">Periode</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filteredRows.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center text-slate-500" colSpan={6}>
                  Ingen personale fundet for de valgte filtre.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr key={`${row.name}-${row.startDate}-${index}`} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {row.name}
                  </td>
                  <td className="px-5 py-4">{row.departmentName}</td>
                  <td className="px-5 py-4">{row.personnelGroupName}</td>
                  <td className="px-5 py-4">{row.shiftTeamName}</td>
                  <td className="px-5 py-4">{row.hoursPerWeek}</td>
                  <td className="px-5 py-4">
                    {formatDate(row.startDate)} - {formatDate(row.endDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
