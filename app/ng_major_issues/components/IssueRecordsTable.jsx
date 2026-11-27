'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Check, ChevronLeft, ChevronRight, ChevronsUpDown, Filter, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatusPill from '@/components/ng_issues/StatusPill';
import { encryptId } from '@/lib/crypto';

const GROUPS = [
  {
    label: 'Issue Details',
    columns: [
      { key: 'IssueNumber', label: 'Issue Number' },
      { key: 'DateRaised', label: 'Date Raised', date: true },
      { key: 'TimeRaised', label: 'Raised Time' },
      { key: 'RaisedSection', label: 'Raised Section' },
      { key: 'SubSection', label: 'Sub Section' },
      { key: 'RaisedPersonId', label: 'Raised Person ID' },
      { key: 'RaisedPersonName', label: 'Raised Person Name' },
      { key: 'TypeOfRequest', label: 'Type of Request' },
      { key: 'Description', label: 'Description', wide: true },
      { key: 'EffectsOn', label: 'Effects On' },
      { key: 'ResponsibleSection', label: 'Responsible Section' },
      { key: 'FirstLevelInformedId', label: 'First Level Informed ID' },
      { key: 'FirstLevelInformedName', label: 'First Level Informed Name' },
      { key: 'ResponsibleSectionHeadId', label: 'Responsible Section Head ID' },
      { key: 'ResponsibleSectionHeadName', label: 'Responsible Section Head Name' },
    ],
  },
  {
    label: 'PPC',
    columns: [
      { key: 'PriorityCategory', label: 'Priority Category' },
      { key: 'ExpectedTargetDate', label: 'Expected Target Date', date: true },
      { key: 'SubmissionStatus', label: 'Submission Status', status: true },
    ],
  },
  {
    label: 'Handler',
    columns: [
      { key: 'HandlerGivenTarget', label: 'Handler Given Target', date: true },
      { key: 'ActualTaskCompletionDate', label: 'Actual Completion Date', date: true },
      { key: 'TaskCompletionStatusByHandler', label: 'Handler Status', status: true },
      { key: 'TaskCompletionStatusByPPC', label: 'PPC Status', status: true },
      { key: 'TaskCompletionPeriod', label: 'Completion Period' },
    ],
  },
];

const COLUMNS = GROUPS.flatMap((group) => group.columns);
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function dateOnly(value) {
  return value ? String(value).split('T')[0] : '';
}

function formatValue(column, row) {
  const value = row[column.key];
  if (value === null || value === undefined || value === '') return '—';
  return column.date ? dateOnly(value) : String(value);
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function DateRangePicker({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()));
  const label = startDate
    ? `${startDate}${endDate ? ` – ${endDate}` : ' – Select end date'}`
    : 'Date range';

  function chooseDate(value) {
    if (!startDate || endDate) {
      onChange(value, '');
      return;
    }
    if (value < startDate) onChange(value, startDate);
    else onChange(startDate, value);
  }

  function renderMonth(month, index) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());
    const days = Array.from({ length: 42 }, (_, dayIndex) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + dayIndex);
      return date;
    });

    return (
      <div key={`${month.getFullYear()}-${month.getMonth()}`} className={index === 1 ? 'hidden sm:block' : ''}>
        <div className="mb-3 text-center text-sm font-semibold text-foreground">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <span key={day} className="py-1 text-center text-[11px] font-medium text-muted-foreground">{day}</span>
          ))}
          {days.map((date) => {
            const value = dateKey(date);
            const inMonth = date.getMonth() === month.getMonth();
            const selected = value === startDate || value === endDate;
            const inRange = startDate && endDate && value > startDate && value < endDate;
            return (
              <button
                key={value}
                type="button"
                disabled={!inMonth}
                onClick={() => chooseDate(value)}
                className={[
                  'h-8 rounded-md text-xs transition-colors',
                  inMonth ? 'text-foreground hover:bg-accent' : 'text-muted-foreground/30',
                  inRange ? 'bg-accent' : '',
                  selected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : '',
                ].join(' ')}
                aria-label={date.toLocaleDateString()}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="min-w-0 justify-start gap-2 font-normal">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
          {(startDate || endDate) && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date range"
              onClick={(event) => {
                event.stopPropagation();
                onChange('', '');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange('', '');
                }
              }}
              className="ml-auto rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[calc(100vw-2rem)] max-w-[42rem] p-3 sm:w-auto">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => setVisibleMonth((month) => shiftMonth(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <p className="text-xs text-muted-foreground">
            {!startDate ? 'Choose a start date' : endDate ? 'Date range selected' : 'Choose an end date'}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => setVisibleMonth((month) => shiftMonth(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {renderMonth(visibleMonth, 0)}
          {renderMonth(shiftMonth(visibleMonth, 1), 1)}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColumnFilter({ column, values, selected, onToggle, onClear }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filteredValues = values.filter((value) => value.toLowerCase().includes(query.toLowerCase()));

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter ${column.label}`}
          className={`rounded p-1 transition-colors hover:bg-accent ${selected.length ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Filter className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold">{column.label}</span>
          {selected.length > 0 && (
            <button type="button" className="text-xs text-primary hover:underline" onClick={onClear}>Clear</button>
          )}
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search values…"
          className="mb-2 h-8"
        />
        <div className="max-h-52 space-y-1 overflow-y-auto">
          {filteredValues.length ? filteredValues.map((value) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent">
              <Checkbox checked={selected.includes(value)} onCheckedChange={() => onToggle(value)} />
              <span className="min-w-0 truncate">{value || '—'}</span>
            </label>
          )) : <p className="px-2 py-4 text-center text-xs text-muted-foreground">No values found.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function IssueRecordsTable({ records, loading, error, emptyMessage }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: '', direction: 'none' });

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    let rows = records.filter((row) => {
      if (query && !COLUMNS.some((column) => String(row[column.key] ?? '').toLowerCase().includes(query))) {
        return false;
      }
      const raisedDate = dateOnly(row.DateRaised);
      if (dateRange.start && (!raisedDate || raisedDate < dateRange.start)) return false;
      if (dateRange.end && (!raisedDate || raisedDate > dateRange.end)) return false;
      return COLUMNS.every((column) => {
        const selected = filters[column.key] ?? [];
        return selected.length === 0 || selected.includes(String(row[column.key] ?? '—'));
      });
    });

    if (sort.direction !== 'none') {
      rows = [...rows].sort((a, b) => {
        const left = String(a[sort.key] ?? '').toLocaleLowerCase();
        const right = String(b[sort.key] ?? '').toLocaleLowerCase();
        const result = left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
        return sort.direction === 'asc' ? result : -result;
      });
    }
    return rows;
  }, [records, search, dateRange, filters, sort]);

  const activeFilterCount = Object.values(filters).reduce((count, values) => count + values.length, 0);

  function toggleFilter(key, value) {
    setFilters((current) => {
      const selected = current[key] ?? [];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      return { ...current, [key]: next };
    });
  }

  function cycleSort(key) {
    setSort((current) => {
      if (current.key !== key || current.direction === 'none') return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return { key: '', direction: 'none' };
    });
  }

  function clearFilters() {
    setSearch('');
    setDateRange({ start: '', end: '' });
    setFilters({});
    setSort({ key: '', direction: 'none' });
  }

  function renderCell(column, row) {
    if (column.status) return <StatusPill status={row[column.key] || undefined} size="sm" />;
    return (
      <span
        className={column.wide ? 'block max-w-[18rem] truncate' : ''}
        title={column.wide ? String(row[column.key] ?? '') : undefined}
      >
        {formatValue(column, row)}
      </span>
    );
  }

  function renderHeader(column) {
    const values = [...new Set(records.map((row) => String(row[column.key] ?? '—')))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    const sortIcon = sort.key === column.key && sort.direction === 'asc'
      ? <ChevronRight className="size-3.5 -rotate-90" />
      : sort.key === column.key && sort.direction === 'desc'
        ? <ChevronRight className="size-3.5 rotate-90" />
        : <ChevronsUpDown className="size-3.5" />;
    return (
      <div key={column.key} className="flex min-w-max items-center gap-1">
        <button
          type="button"
          onClick={() => cycleSort(column.key)}
          className="inline-flex items-center gap-1.5 rounded px-1 py-1 text-left font-semibold text-foreground hover:bg-accent"
          title="Click to sort ascending, descending, or reset"
        >
          {column.label}
          {sortIcon}
        </button>
        <ColumnFilter
          column={column}
          values={values}
          selected={filters[column.key] ?? []}
          onToggle={(value) => toggleFilter(column.key, value)}
          onClear={() => setFilters((current) => ({ ...current, [column.key]: [] }))}
        />
      </div>
    );
  }

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:p-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search all issue columns"
            placeholder="Search all issues…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onChange={(start, end) => setDateRange({ start, end })}
        />
        {(search || dateRange.start || activeFilterCount || sort.direction !== 'none') && (
          <Button type="button" variant="ghost" onClick={clearFilters} className="shrink-0">
            <X className="size-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {loading ? 'Loading issues…' : `Showing ${filteredRecords.length} of ${records.length} issues`}
          {activeFilterCount > 0 ? ` · ${activeFilterCount} column filter${activeFilterCount === 1 ? '' : 's'} active` : ''}
        </span>
        {sort.direction !== 'none' && <span>Sorted by {COLUMNS.find((column) => column.key === sort.key)?.label} ({sort.direction})</span>}
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load records: {error}
        </div>
      )}

      <div className="hidden overflow-auto rounded-xl border bg-card shadow-sm lg:block">
        <table className="min-w-full border-separate border-spacing-0 text-xs text-card-foreground">
          <thead className="sticky top-0 z-20">
            <tr>
              {GROUPS.map((group) => (
                <th
                  key={group.label}
                  colSpan={group.columns.length}
                  className="border-b border-r bg-muted px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground last:border-r-0"
                >
                  {group.label}
                </th>
              ))}
              <th className="border-b bg-muted px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
            <tr>
              {GROUPS.flatMap((group) => group.columns).map((column) => (
                <th key={column.key} className="border-b border-r bg-card px-2 py-2 text-left last:border-r-0">
                  {renderHeader(column)}
                </th>
              ))}
              <th className="border-b bg-card px-3 py-2 text-left">Edit</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }, (_, index) => (
              <tr key={index} className="animate-pulse">
                {COLUMNS.map((column) => <td key={column.key} className="border-b border-r px-2 py-3"><div className="h-3 rounded bg-muted" /></td>)}
                <td className="border-b px-2 py-3"><div className="h-6 rounded bg-muted" /></td>
              </tr>
            )) : filteredRecords.length === 0 ? (
              <tr><td colSpan={COLUMNS.length + 1} className="px-4 py-14 text-center text-sm text-muted-foreground">{emptyMessage || 'No issues match your filters.'}</td></tr>
            ) : filteredRecords.map((row, index) => (
              <tr key={row.Id ?? index} className="group transition-colors hover:bg-accent/50">
                {COLUMNS.map((column) => (
                  <td key={column.key} className="max-w-[18rem] border-b border-r px-2.5 py-2.5 align-middle last:border-r-0">
                    {renderCell(column, row)}
                  </td>
                ))}
                <td className="border-b px-2 py-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/ng_major_issues/form?id=${encryptId(row.Id)}`)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {!loading && filteredRecords.length === 0 && (
          <div className="rounded-xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
            {emptyMessage || 'No issues match your filters.'}
          </div>
        )}
        {loading && Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl border bg-card" />
        ))}
        {!loading && filteredRecords.map((row, index) => (
          <article key={row.Id ?? index} className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b p-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-card-foreground">Issue {row.IssueNumber || '—'}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{formatValue({ key: 'DateRaised', date: true }, row)} · {row.RaisedSection || 'No section'}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => router.push(`/ng_major_issues/form?id=${encryptId(row.Id)}`)}>Edit</Button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="col-span-2 text-xs">
                <p className="mb-1 text-muted-foreground">Description</p>
                <p className="line-clamp-2 text-card-foreground">{row.Description || '—'}</p>
              </div>
              <div className="text-xs">
                <p className="mb-1 text-muted-foreground">Priority</p>
                <p className="text-card-foreground">{row.PriorityCategory || '—'}</p>
              </div>
              <div className="text-xs">
                <p className="mb-1 text-muted-foreground">Handler status</p>
                <StatusPill status={row.TaskCompletionStatusByHandler || undefined} size="sm" />
              </div>
            </div>
            <details className="border-t px-4 py-3">
              <summary className="cursor-pointer text-xs font-medium text-primary">View all issue details</summary>
              <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {COLUMNS.map((column) => (
                  <div key={column.key} className="min-w-0 text-xs">
                    <dt className="mb-1 text-muted-foreground">{column.label}</dt>
                    <dd className="break-words text-card-foreground">{renderCell(column, row)}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
