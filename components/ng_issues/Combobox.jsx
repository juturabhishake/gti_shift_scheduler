'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export default function Combobox({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option...',
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const [triggerWidth, setTriggerWidth] = useState(null);

  useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query.trim()
    ? options.filter((item) => {
        const text =
          typeof item === 'object'
            ? `${item.label || item.Username || ''} ${item.value || item.EmployeeId || ''}`
            : String(item);
        return text.toLowerCase().includes(query.toLowerCase());
      })
    : options;

  let displayLabel = '';
  if (value) {
    const found = options.find((opt) =>
      typeof opt === 'object' ? (opt.value || opt.EmployeeId) === value : opt === value
    );
    if (found) {
      displayLabel =
        typeof found === 'object' ? found.label || `${found.EmployeeId} - ${found.Username}` : found;
    } else {
      displayLabel = value;
    }
  }

  function handleSelect(val) {
    onChange?.(val);
    setOpen(false);
    setQuery('');
  }

  return (
    <Popover open={disabled ? false : open} onOpenChange={(v) => { if (!disabled) setOpen(v); }}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          ref={triggerRef}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border bg-card/80 px-3 py-2 text-sm text-left shadow-sm backdrop-blur transition-all',
            'border-border text-foreground hover:border-primary/50',
            open && !disabled && 'border-primary ring-2 ring-primary/20',
            disabled ? 'cursor-not-allowed opacity-50 bg-muted/40 pointer-events-none select-none' : 'cursor-pointer',
            className
          )}
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {displayLabel || placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.('');
                }}
                className="rounded p-0.5 hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronDown className={cn('size-4 transition-transform duration-200', open && !disabled && 'rotate-180')} />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        style={{ width: triggerWidth ? `${triggerWidth}px` : 'var(--radix-popover-trigger-width)' }}
        className="z-[9999] rounded-xl border border-border bg-popover p-1.5 shadow-2xl backdrop-blur-2xl"
      >
        <div className="px-1 pb-1.5">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-full rounded-md border border-border/80 bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">No results found.</div>
          ) : (
            filtered.map((item, idx) => {
              const itemVal = typeof item === 'object' ? item.value || item.EmployeeId : item;
              const itemLabel =
                typeof item === 'object' ? item.label || `${item.EmployeeId} - ${item.Username}` : item;
              const isSelected = itemVal === value;

              return (
                <div
                  key={itemVal ?? idx}
                  onClick={() => handleSelect(itemVal)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <span className="truncate">{itemLabel}</span>
                  {isSelected && <Check className="size-3.5 shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
