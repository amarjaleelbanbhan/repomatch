/**
 * Table
 *
 * Sortable + client-side paginated.
 *
 * Row count assumption (verified against codebase):
 *   Supabase queries in matches/page.tsx use .order("rank").limit() per cycle.
 *   Max recommendations per user: 20/cycle × ~10 cycles visible = ~200 rows max.
 *   No unbounded fetches exist in the codebase. Virtualization NOT included.
 *   If row counts grow beyond 200 in future, integrate react-virtual here.
 *
 * Keyboard: Column sort headers are Tab-able; Enter/Space sorts;
 *           aria-sort updates to "ascending"/"descending"/"none".
 *           Pagination buttons are Tab-able.
 *
 * Usage:
 *   <Table
 *     columns={[
 *       { key: "repo", label: "Repository", sortable: true },
 *       { key: "stars", label: "Stars", sortable: true },
 *       { key: "lang", label: "Language" },
 *     ]}
 *     rows={matches.map(m => ({ repo: m.fullName, stars: m.stars, lang: m.languages[0] }))}
 *     pageSize={20}
 *     emptyMessage="No matches found."
 *   />
 *
 * Props:
 *   columns      TableColumn[]
 *   rows         Record<string, ReactNode>[]
 *   pageSize     number  (default: 20)
 *   emptyMessage string
 *   className    string
 */

"use client";

import { useMemo, useState, type ReactNode } from "react";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  minWidth?: number;
}

interface Props {
  columns: TableColumn[];
  rows: Record<string, ReactNode>[];
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

type SortDir = "asc" | "desc" | null;

export function Table({
  columns,
  rows,
  pageSize = 20,
  emptyMessage = "No data to display.",
  className = "",
}: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return rows;
    return [...rows].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const num = !isNaN(Number(av)) && !isNaN(Number(bv));
      const cmp = num ? Number(av) - Number(bv) : av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const isEmpty = rows.length === 0;

  return (
    <div className={["rm-table-wrapper", className].filter(Boolean).join(" ")}>
      <table className="rm-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ minWidth: col.minWidth }}
                aria-sort={
                  sortKey === col.key && sortDir
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className="rm-table__sort-btn rm-table__sort-btn rm-table__sort-btn"
                    onClick={() => handleSort(col.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSort(col.key);
                      }
                    }}
                  >
                    {col.label}
                    <span
                      className={[
                        "rm-table__sort-icon",
                        sortKey === col.key && sortDir
                          ? "rm-table__sort-icon--active"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden="true"
                    >
                      {sortKey === col.key && sortDir === "desc" ? "↓" : "↑"}
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="rm-table__empty">
                  <div className="rm-table__empty-icon" aria-hidden="true">
                    ◻
                  </div>
                  <p className="rm-table__empty-text">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            pageRows.map((row, ri) => (
              <tr key={ri}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!isEmpty && totalPages > 1 && (
        <div className="rm-table-pagination">
          <span>
            {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="rm-table-pagination__controls">
            <button
              type="button"
              className="rm-button rm-button rm-button rm-button--ghost rm-button--sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              ‹ Prev
            </button>
            <span>
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              className="rm-button rm-button rm-button rm-button--ghost rm-button--sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
