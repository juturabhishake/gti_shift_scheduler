'use client';

import React, { useState } from 'react';
import { Filter, Check, Search } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function MultiSelectFilter({
  title = 'Filter',
  options = [],
  selected = [],
  onChange,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredOptions = query.trim()
    ? options.filter((opt) => String(opt).toLowerCase().includes(query.toLowerCase()))
    : options;

  function toggleOption(opt) {
    if (selected.includes(opt)) {
      onChange(selected.filter((x) => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium shadow-sm transition-all',
            selected.length > 0
              ? 'border-primary/60 bg-primary/10 text-primary hover:bg-primary/20'
              : 'border-border/70 bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground',
            className
          )}
        >
          <Filter className="size-3" />
          {/* <span className="truncate max-w-[120px]">{title}</span> */}
          {selected.length > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {selected.length}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-64 p-2 z-[9999] rounded-xl border border-border bg-popover shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-1.5 mb-1.5 px-1">
          <span className="text-xs font-semibold text-foreground">{title}</span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search values..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-7 w-full rounded-md border border-border/80 bg-background pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="max-h-52 overflow-y-auto space-y-0.5">
          {filteredOptions.length === 0 ? (
            <div className="py-3 text-center text-xs text-muted-foreground">No options found.</div>
          ) : (
            filteredOptions.map((opt, i) => {
              const isChecked = selected.includes(opt);
              return (
                <div
                  key={opt || i}
                  onClick={() => toggleOption(opt)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors',
                    isChecked
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <span className="truncate pr-2">{opt || '—'}</span>
                  <div
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border transition-all',
                      isChecked ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                    )}
                  >
                    {isChecked && <Check className="size-3" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
