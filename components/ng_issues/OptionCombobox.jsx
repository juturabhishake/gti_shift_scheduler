'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export default function OptionCombobox({
  value = '',
  onChange,
  options = [],
  disabled = false,
  placeholder = 'Select an option…',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find((option) => option === value);
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? options.filter((option) => option.toLowerCase().includes(query))
      : options;
  }, [options, search]);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm text-foreground shadow-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={selected ? 'truncate' : 'truncate text-muted-foreground'}>
            {selected || placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search options…"
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option}
                role="option"
                aria-selected={option === value}
                tabIndex={0}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setSearch('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onChange(option);
                    setOpen(false);
                    setSearch('');
                  }
                }}
                className="cursor-pointer"
              >
                <Check className={`size-4 ${option === value ? 'opacity-100' : 'opacity-0'}`} />
                {option}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
