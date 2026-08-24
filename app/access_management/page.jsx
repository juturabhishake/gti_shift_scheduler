"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Filter,
  MoreHorizontal,
  Loader2,
  X,
  CheckSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAdminAccessCheck } from "@/lib/useAdminAccessCheck";

const formatAccessText = (access) => {
  if (!access) return "N/A";
  return String(access)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim().toLowerCase();
};

const multiSelectFilter = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    return true;
  }
  const rowValue = normalizeValue(row.getValue(columnId));
  return filterValue.some(
    (value) => normalizeValue(value) === rowValue
  );
};

const ActionsCell = ({ row, onEdit, onDelete }) => {
  const role = row.original;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(role)} className="cursor-pointer">
          Edit Access
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(role.id)} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MultiSelectFilter = ({ title, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedValues = Array.isArray(value) ? value : [];

  const toggleOption = (optionValue) => {
    const exists = selectedValues.some((item) => normalizeValue(item) === normalizeValue(optionValue));
    if (exists) {
      onChange(selectedValues.filter((item) => normalizeValue(item) !== normalizeValue(optionValue)));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  const clearFilter = () => {
    onChange([]);
    setSearch("");
  };

  const filteredOptions = options.filter(opt =>
    String(opt.label).toLowerCase().includes(search.toLowerCase()) ||
    String(opt.value).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={(val) => { setOpen(val); if (!val) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-grid size-8 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30",
            selectedValues.length > 0 && "text-primary bg-primary/10"
          )}
          aria-label={`Filter by ${title}`}
        >
          <Filter className="size-3.5" />
          {selectedValues.length > 0 && (
            <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-primary" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-64 bg-card border border-primary/15 rounded-xl shadow-xl p-2 z-[9999]">
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-background border border-primary/20 rounded-lg p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          <button
            type="button"
            onClick={clearFilter}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-primary/5 rounded cursor-pointer text-left text-foreground font-semibold transition"
          >
            <CheckSquare className={cn("w-3.5 h-3.5 shrink-0", selectedValues.length === 0 ? "text-primary opacity-100" : "opacity-0")} />
            <span>All values (Clear)</span>
          </button>
          {filteredOptions.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-4">No matches found.</p>
          ) : (
            filteredOptions.map((option) => {
              const selected = selectedValues.some((item) => normalizeValue(item) === normalizeValue(option.value));
              return (
                <button
                  key={`${String(option.value)}-${String(option.label)}`}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded cursor-pointer text-left transition",
                    selected ? "bg-primary/10 text-foreground font-semibold" : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CheckSquare className={cn("w-3.5 h-3.5 shrink-0", selected ? "text-primary" : "text-muted-foreground/40")} />
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const SortableHeader = ({ column, children, options = [] }) => {
  const direction = column.getIsSorted();
  const filterValue = Array.isArray(column.getFilterValue()) ? column.getFilterValue() : [];

  const cycleSort = () => {
    if (!direction) {
      column.toggleSorting(false);
    } else if (direction === "asc") {
      column.toggleSorting(true);
    } else {
      column.clearSorting();
    }
  };

  const handleFilterChange = (nextValue) => {
    column.setFilterValue(nextValue);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        className="h-8 gap-1 px-2 font-semibold hover:bg-primary/10"
        onClick={cycleSort}
        title={direction === "asc" ? "Sort descending" : direction === "desc" ? "Reset sort" : "Sort ascending"}
      >
        {children}
        {direction === "asc" && <ArrowUp className="size-3.5 text-primary" />}
        {direction === "desc" && <ArrowDown className="size-3.5 text-primary" />}
      </Button>
      {options.length > 0 && (
        <MultiSelectFilter title={`Filter ${children}`} options={options} value={filterValue} onChange={handleFilterChange} />
      )}
    </div>
  );
};

const columns = ({ onEdit, onDelete, filterOptions }) => [
  {
    accessorKey: "empId",
    header: ({ column }) => (
      <SortableHeader column={column} options={filterOptions.empId}>
        Employee ID
      </SortableHeader>
    ),
    filterFn: "multiSelect",
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <SortableHeader column={column} options={filterOptions.username}>
        Username
      </SortableHeader>
    ),
    filterFn: "multiSelect",
  },
  {
    accessorKey: "page",
    header: ({ column }) => (
      <SortableHeader column={column} options={filterOptions.page}>
        Page
      </SortableHeader>
    ),
    filterFn: "multiSelect",
  },
  {
    accessorKey: "access_name",
    header: ({ column }) => (
      <SortableHeader column={column} options={filterOptions.access_name}>
        Access
      </SortableHeader>
    ),
    cell: ({ row }) => formatAccessText(row.original.access_name),
    filterFn: "multiSelect",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
];

const Combobox = ({ options, value, onSelect, placeholder, disabled = false, searchPlaceholder = "Search..." }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel = options.find(
    (option) => normalizeValue(option.value) === normalizeValue(value?.value)
  )?.label;

  const handleSelect = (option) => {
    onSelect(option);
    setOpen(false);
    setSearch("");
  };

  const filteredOptions = options.filter(opt =>
    String(opt.label).toLowerCase().includes(search.toLowerCase()) ||
    String(opt.value).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={(val) => { setOpen(val); if (!val) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="w-full flex items-center justify-between text-sm bg-background border border-primary/20 rounded-lg p-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none min-h-10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left"
        >
          <span className="truncate font-semibold text-xs">
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="z-[9999] w-[var(--radix-popover-trigger-width)] bg-card border border-primary/20 rounded-xl shadow-xl p-2">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-background border border-primary/20 rounded-lg p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {filteredOptions.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-4">No results found.</p>
          ) : (
            filteredOptions.map((option) => {
              const selected = normalizeValue(value?.value) === normalizeValue(option.value);
              return (
                <button
                  key={`${String(option.value)}-${String(option.label)}`}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full text-left rounded-md px-2.5 py-1.5 flex items-center justify-between transition cursor-pointer text-xs",
                    selected ? "bg-primary/10 text-foreground font-semibold" : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const RoleManagementTable = () => {
  const PAGE_ID_FOR_THIS_FORM = 7;

  const {
    isLoading: isAccessLoading,
    hasAccess,
  } = useAdminAccessCheck(PAGE_ID_FOR_THIS_FORM);

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [accessTypes, setAccessTypes] = useState([]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle");

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedAccess, setSelectedAccess] = useState(null);
  const [pageOptions, setPageOptions] = useState([]);

  const filterOptions = useMemo(
    () => ({
      empId: [
        ...new Set(
          data
            .map((row) => row.empId)
            .filter(
              (value) =>
                value !== null &&
                value !== undefined &&
                value !== ""
            )
        ),
      ].map((value) => ({
        value,
        label: String(value),
      })),

      username: [
        ...new Set(
          data
            .map((row) => row.username)
            .filter(
              (value) =>
                value !== null &&
                value !== undefined &&
                value !== ""
            )
        ),
      ].map((value) => ({
        value,
        label: String(value),
      })),

      page: [
        ...new Set(
          data
            .map((row) => row.page)
            .filter(
              (value) =>
                value !== null &&
                value !== undefined &&
                value !== ""
            )
        ),
      ].map((value) => ({
        value,
        label: String(value),
      })),

      access_name: [
        ...new Set(
          data
            .map((row) => row.access_name)
            .filter(
              (value) =>
                value !== null &&
                value !== undefined &&
                value !== ""
            )
        ),
      ].map((value) => ({
        value,
        label: formatAccessText(value),
      })),
    }),
    [data]
  );

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user.EmployeeId,
        label: `${user.Username} (${user.EmployeeId})`,
        original: user,
      })),
    [users]
  );

  const accessTypeOptions = useMemo(
    () =>
      accessTypes.map((type) => ({
        value: type.id,
        label: formatAccessText(type.access_type),
      })),
    [accessTypes]
  );

  useEffect(() => {
    if (isAccessLoading) {
      return;
    }
  }, [isAccessLoading, hasAccess]);

  const fetchData = async (showPageLoader = true) => {
    if (showPageLoader) {
      setIsLoading(true);
    }

    try {
      const [rolesRes, usersRes, accessTypesRes, pagesRes] = await Promise.all([
        fetch("/api/access/getAllAccess"),
        fetch("/api/access/getUsers"),
        fetch("/api/access/getAccessTypes"),
        fetch("/api/access/getPages"),
      ]);

      if (!rolesRes.ok) throw new Error("Failed to fetch roles");
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      if (!accessTypesRes.ok) throw new Error("Failed to fetch access types");
      if (!pagesRes.ok) throw new Error("Failed to fetch pages");

      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();
      const accessTypesData = await accessTypesRes.json();
      const pagesData = await pagesRes.json();

      setData(Array.isArray(rolesData) ? rolesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setAccessTypes(Array.isArray(accessTypesData) ? accessTypesData : []);
      setPageOptions(
        (Array.isArray(pagesData) ? pagesData : []).map((page) => ({
          value: page.id,
          label: page.page,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const sortedData = [...data].sort((a, b) =>
      String(a.empId).localeCompare(String(b.empId))
    );

    let lastEmpId = null;
    let groupIndex = -1;

    return sortedData.map((row) => {
      if (row.empId !== lastEmpId) {
        groupIndex++;
        lastEmpId = row.empId;
      }

      return {
        ...row,
        groupIndex,
      };
    });
  }, [data]);

  const resetModalState = () => {
    setSelectedUser(null);
    setSelectedPage(null);
    setSelectedAccess(null);
    setSaveStatus("idle");
  };

  const handleCreate = () => {
    setIsCreateMode(true);
    resetModalState();
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setIsCreateMode(false);

    setSelectedUser(
      userOptions.find(
        (user) => normalizeValue(user.value) === normalizeValue(role.empId)
      ) || null
    );

    setSelectedPage(
      pageOptions.find(
        (page) => normalizeValue(page.value) === normalizeValue(role.page_id)
      ) || null
    );

    setSelectedAccess(
      accessTypeOptions.find(
        (access) => normalizeValue(access.value) === normalizeValue(role.access_id)
      ) || null
    );

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this role access?")) {
      return;
    }

    try {
      const response = await fetch("/api/access/deleteAccess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await fetchData();
    } catch (error) {
      console.error("Failed to delete role access:", error);
    }
  };

  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        filterOptions,
      }),
    [filterOptions]
  );

  const handleSave = async () => {
    if (!selectedUser || !selectedPage || !selectedAccess) {
      alert("Please select an employee, page, and access type.");
      return;
    }

    setSaveStatus("loading");

    const payload = {
      empId: selectedUser.value,
      username: selectedUser.original.Username,
      modifiedBy: "admin",
      page_id: selectedPage.value,
      access: selectedAccess.value,
    };

    try {
      const response = await fetch("/api/access/giveAccess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setSaveStatus("success");
      await fetchData(false);

      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to save role access:", error);
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }
  };

  const table = useReactTable({
    data: groupedData,
    columns: tableColumns,

    state: {
      globalFilter,
      columnFilters,
      sorting,
    },

    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,

    filterFns: {
      multiSelect: multiSelectFilter,
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    autoResetPageIndex: true,
  });

  if (isAccessLoading || isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    // <div className="rounded-xl border bg-card p-4 text-zinc-800 dark:text-white md:p-6">
    <div className="@container/main glass-surface rounded-2xl p-4 text-zinc-800 dark:text-white md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-primary md:text-2xl">
          Access Management
        </h1>
        <Button onClick={handleCreate}>Create Role Access</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <span hidden className="rounded-full border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          Use the filter icons in each column
        </span>
      </div>

      <div className="rounded-md border p-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-bold text-primary">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    row.original.groupIndex % 2 === 0 ? "bg-foreground/[.035]" : "",
                    "hover:bg-foreground/[.06]"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Create Role Access" : "Edit Role Access"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee" className="text-right">
                Employee
              </Label>
              <div className="col-span-3 min-w-0">
                <Combobox
                  options={userOptions}
                  value={selectedUser}
                  onSelect={setSelectedUser}
                  placeholder="Select an employee"
                  searchPlaceholder="Search by name or ID..."
                  disabled={!isCreateMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="page" className="text-right">
                Page
              </Label>
              <div className="col-span-3 min-w-0">
                <Combobox
                  options={pageOptions}
                  value={selectedPage}
                  onSelect={setSelectedPage}
                  placeholder="Select a page"
                  searchPlaceholder="Search page..."
                  disabled={!isCreateMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="access" className="text-right">
                Access
              </Label>
              <div className="col-span-3 min-w-0">
                <Combobox
                  options={accessTypeOptions}
                  value={selectedAccess}
                  onSelect={setSelectedAccess}
                  placeholder="Select access type"
                  searchPlaceholder="Search access type..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveStatus === "loading"}>
              {saveStatus === "loading" && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === "success" && (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  <span>Saved</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <X className="mr-2 h-4 w-4" />
                  <span>Error</span>
                </>
              )}
              {saveStatus === "idle" && <span>Save</span>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagementTable;