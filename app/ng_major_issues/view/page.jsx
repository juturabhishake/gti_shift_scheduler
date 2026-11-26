'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, ExternalLink, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { useIssues } from '@/app/ng_major_issues/context/IssuesContext';
import StatusPill from '@/components/ng_issues/StatusPill';
import MultiSelectFilter from '@/components/ng_issues/MultiSelectFilter';
import DateRangePicker from '@/components/ng_issues/DateRangePicker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAccessCheck } from "@/lib/useAccessCheck";
const COLUMNS = [
  { key: 'IssueNumber', label: 'Issue Number', group: 'Issue Details' },
  { key: 'DateRaised', label: 'Date Raised', group: 'Issue Details' },
  { key: 'TimeRaised', label: 'Raised Time', group: 'Issue Details' },
  { key: 'RaisedSection', label: 'Raised Section', group: 'Issue Details' },
  { key: 'SubSection', label: 'Sub Section', group: 'Issue Details' },
  { key: 'RaisedPersonName', label: 'Raised Person', group: 'Issue Details' },
  { key: 'TypeOfRequest', label: 'Type of Request', group: 'Issue Details' },
  { key: 'Description', label: 'Description', group: 'Issue Details' },
  { key: 'EffectsOn', label: 'Effects On', group: 'Issue Details' },
  { key: 'ResponsibleSection', label: 'Responsible Section', group: 'Issue Details' },
  { key: 'FirstLevelInformedName', label: 'First Level Informed', group: 'Issue Details' },
  { key: 'ResponsibleSectionHeadName', label: 'Responsible Section Head', group: 'Issue Details' },
  { key: 'PriorityCategory', label: 'Priority Category', group: 'PPC Review' },
  { key: 'ExpectedTargetDate', label: 'Expected Target Date', group: 'PPC Review' },
  { key: 'SubmissionStatus', label: 'Submission Status', group: 'PPC Review', isStatus: true },
  { key: 'HandlerGivenTarget', label: 'Handler Given Target', group: 'Handler' },
  { key: 'ActualTaskCompletionDate', label: 'Actual Completion Date', group: 'Handler' },
  { key: 'TaskCompletionStatusByHandler', label: 'Status By Handler', group: 'Handler', isStatus: true },
  { key: 'TaskCompletionStatusByPPC', label: 'Status By PPC', group: 'Handler', isStatus: true },
  { key: 'TaskCompletionPeriod', label: 'Completion Period', group: 'Handler' },
  { key: 'CreatedBy', label: 'Created By', group: 'Audit' },
  { key: 'UpdatedBy', label: 'Updated By', group: 'Audit' },
];

function formatDate(val) {
  if (!val) return '—';
  return String(val).split('T')[0];
}

function cellValue(col, row) {
  const v = row[col.key];
  if (v === null || v === undefined || v === '') return '—';
  if (col.key.toLowerCase().includes('date')) return formatDate(v);
  return String(v);
}

export default function ViewPage() {
  const router = useRouter();
  const PAGE_ID_FOR_THIS_FORM = 2036;
  const {
    isLoading: isAccessLoading,
    hasAccess,
  } = useAccessCheck(PAGE_ID_FOR_THIS_FORM);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [globalSearch, setGlobalSearch] = useState('');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });
  const [columnFilters, setColumnFilters] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    let cancelled = false;

    let url = '/api/issues/list?viewType=ALL&employeeId=ALL';
    if (dateRange?.from) {
      url += `&fromDate=${format(dateRange.from, 'yyyy-MM-dd')}`;
    }
    if (dateRange?.to) {
      url += `&toDate=${format(dateRange.to, 'yyyy-MM-dd')}`;
    }

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setRecords(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateRange?.from, dateRange?.to]);

  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      if (prev.direction === 'desc') return { key: null, direction: 'default' };
      return { key, direction: 'asc' };
    });
  }

  function handleColumnFilterChange(key, values) {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
    setCurrentPage(1);
    setPageInput('1');
  }

  function resetAllFilters() {
    setGlobalSearch('');
    setDateRange({ from: undefined, to: undefined });
    setColumnFilters({});
    setSortConfig({ key: null, direction: 'default' });
    setCurrentPage(1);
    setPageInput('1');
  }

  const uniqueColumnValues = useMemo(() => {
    const map = {};
    COLUMNS.forEach((c) => {
      const vals = new Set();
      records.forEach((r) => {
        const val = r[c.key];
        if (val !== null && val !== undefined && val !== '') {
          vals.add(c.key.toLowerCase().includes('date') ? formatDate(val) : String(val));
        }
      });
      map[c.key] = Array.from(vals).sort();
    });
    return map;
  }, [records]);

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    if (globalSearch.trim()) {
      const q = globalSearch.trim().toLowerCase();
      result = result.filter((row) =>
        COLUMNS.some((col) => {
          const v = row[col.key];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }

    Object.entries(columnFilters).forEach(([colKey, selectedValues]) => {
      if (selectedValues && selectedValues.length > 0) {
        result = result.filter((row) => {
          const val = row[colKey];
          const formatted = colKey.toLowerCase().includes('date') ? formatDate(val) : String(val ?? '');
          return selectedValues.includes(formatted);
        });
      }
    });

    if (sortConfig.key && sortConfig.direction !== 'default') {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        const aVal = a[key] ?? '';
        const bVal = b[key] ?? '';
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [records, globalSearch, columnFilters, sortConfig]);

  const totalRecords = filteredAndSortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  function goToPage(p) {
    const valid = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(valid);
    setPageInput(String(valid));
  }

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRecords.slice(start, start + pageSize);
  }, [filteredAndSortedRecords, currentPage, pageSize]);

  const activeFiltersCount =
    (globalSearch ? 1 : 0) +
    (dateRange?.from ? 1 : 0) +
    Object.values(columnFilters).reduce((acc, curr) => acc + (curr?.length > 0 ? 1 : 0), 0);

  return (
    <div className="flex min-h-screen flex-col Complete and Save Section 1 first space-y-4 mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            NG Major Issues — All Records
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time interactive matrix with dynamic multi-filters, SQL date range, and pagination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            {loading ? 'Loading...' : `${totalRecords} records found`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2.5 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search across all columns..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
                setPageInput('1');
              }}
              className="h-10 w-full rounded-xl border border-border/80 bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />

          {activeFiltersCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-border/80 bg-card/60 px-3.5 text-xs font-semibold text-foreground hover:bg-accent transition-all shadow-sm"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset All ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          Failed to load records: {error}
        </div>
      )}

      <div className="rounded-2xl border border-border/80 bg-card/70 shadow-md backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[58vh] min-h-[380px] relative">
          <table className="w-full border-collapse text-left text-xs text-foreground">
            <thead className="sticky top-0 z-30 bg-muted/95 backdrop-blur-md border-b border-border shadow-sm">
              <tr>
                <th className="border-r border-border/60 px-3 py-3 font-semibold text-muted-foreground text-center w-16 sticky left-0 z-40 bg-muted/95">
                  Actions
                </th>
                {COLUMNS.map((col) => {
                  const isSorted = sortConfig.key === col.key;
                  const filterOptions = uniqueColumnValues[col.key] || [];
                  const selectedVals = columnFilters[col.key] || [];

                  return (
                    <th
                      key={col.key}
                      className="border-r border-border/60 px-3 py-2.5 font-semibold text-foreground whitespace-nowrap min-w-[150px]"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1.5 cursor-pointer select-none hover:text-primary transition-colors"
                          title="Click to sort (Asc / Desc / Reset)"
                        >
                          <span>{col.label}</span>
                          <span className="text-muted-foreground">
                            {isSorted && sortConfig.direction === 'asc' && <ArrowUp className="size-3.5 text-primary" />}
                            {isSorted && sortConfig.direction === 'desc' && <ArrowDown className="size-3.5 text-primary" />}
                            {(!isSorted || sortConfig.direction === 'default') && <ArrowUpDown className="size-3 text-muted-foreground/60" />}
                          </span>
                        </span>

                        <MultiSelectFilter
                          title={col.label}
                          options={filterOptions}
                          selected={selectedVals}
                          onChange={(vals) => handleColumnFilterChange(col.key, vals)}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {loading ? (
                Array.from({ length: 8 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="border-r border-border/60 px-3 py-3 sticky left-0 bg-card">
                      <div className="h-4 w-10 bg-muted rounded" />
                    </td>
                    {COLUMNS.map((c) => (
                      <td key={c.key} className="border-r border-border/60 px-3 py-3">
                        <div className="h-4 bg-muted rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="py-16 text-center text-sm font-medium text-muted-foreground"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row, idx) => (
                  <tr
                    key={row.Id ?? idx}
                    className="transition-colors hover:bg-muted/40 cursor-default group"
                  >
                    <td className="border-r border-border/60 px-2.5 py-2.5 text-center whitespace-nowrap sticky left-0 bg-card/90 backdrop-blur z-20 group-hover:bg-muted/60">
                      <button
                        onClick={() => router.push(`/ng_major_issues/form?id=${row.Id}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <ExternalLink className="size-3" />
                        <span>Edit</span>
                      </button>
                    </td>

                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'border-r border-border/60 px-3 py-2.5 whitespace-nowrap text-xs text-foreground/90',
                          col.key === 'Description' && 'max-w-[280px] truncate'
                        )}
                        title={col.key === 'Description' ? String(row[col.key] ?? '') : undefined}
                      >
                        {col.isStatus ? (
                          <StatusPill status={row[col.key] || undefined} size="sm" />
                        ) : (
                          cellValue(col, row)
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-card/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                goToPage(1);
              }}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground outline-none cursor-pointer"
            >
              {[10, 15, 25, 50, 100].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground ml-2">
              Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              title="First Page"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="size-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1 px-2 text-xs font-medium text-foreground">
              <span>Page</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const p = parseInt(pageInput, 10);
                    if (!isNaN(p)) goToPage(p);
                  }
                }}
                onBlur={() => {
                  const p = parseInt(pageInput, 10);
                  if (!isNaN(p)) goToPage(p);
                  else setPageInput(String(currentPage));
                }}
                className="h-7 w-12 rounded-md border border-border bg-background text-center text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
              <span className="text-muted-foreground">/ {totalPages}</span>
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
