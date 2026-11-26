'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, X, ChevronDown, Check } from 'lucide-react';
import { format, setMonth as setFnsMonth, setYear as setFnsYear } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DateRangePicker({ dateRange, setDateRange, className = '' }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [yearInput, setYearInput] = useState('');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef(null);

  const displayedYear = yearInput !== '' ? yearInput : String(currentMonth.getFullYear());

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
        setMonthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleYearChange(e) {
    const val = e.target.value;
    setYearInput(val);
    const y = parseInt(val, 10);
    if (!isNaN(y) && y >= 1900 && y <= 2100) {
      setCurrentMonth((prev) => setFnsYear(prev || new Date(), y));
    }
  }

  function handleSelectMonth(idx) {
    setCurrentMonth((prev) => setFnsMonth(prev || new Date(), idx));
    setMonthDropdownOpen(false);
  }

  let displayLabel = 'Filter by Date Range';
  if (dateRange?.from) {
    if (dateRange?.to) {
      displayLabel = `${format(dateRange.from, 'dd MMM yyyy')} - ${format(dateRange.to, 'dd MMM yyyy')}`;
    } else {
      displayLabel = format(dateRange.from, 'dd MMM yyyy');
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-3.5 text-xs font-medium shadow-sm backdrop-blur transition-all',
            dateRange?.from
              ? 'border-primary/60 bg-primary/10 text-primary font-semibold hover:bg-primary/20'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-primary" />
          <span className="truncate">{displayLabel}</span>
          {dateRange?.from && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setDateRange({ from: undefined, to: undefined });
              }}
              className="ml-1 rounded-full p-0.5 hover:bg-primary/30"
            >
              <X className="size-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-auto p-2.5 z-[9999] rounded-2xl border border-border bg-popover shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2 mb-1 px-1">
          <span className="text-xs font-semibold text-foreground">Select Range</span>

          <div className="flex items-center gap-1.5">
            <div ref={monthDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setMonthDropdownOpen((v) => !v)}
                className="flex h-7 items-center justify-between gap-1 rounded-md border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:border-primary transition-all"
              >
                <span>{MONTH_NAMES[currentMonth.getMonth()]}</span>
                <ChevronDown className="size-3 opacity-60" />
              </button>

              {monthDropdownOpen && (
                <div className="absolute left-0 top-8 z-[10000] w-32 rounded-lg border border-border bg-popover p-1 shadow-xl max-h-48 overflow-y-auto">
                  {MONTH_NAMES.map((name, idx) => {
                    const isSel = currentMonth.getMonth() === idx;
                    return (
                      <div
                        key={name}
                        onClick={() => handleSelectMonth(idx)}
                        className={cn(
                          'flex items-center justify-between px-2 py-1 text-xs rounded-md cursor-pointer transition-colors',
                          isSel ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-accent text-foreground'
                        )}
                      >
                        <span>{name}</span>
                        {isSel && <Check className="size-3" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">Yr:</span>
              <input
                type="number"
                value={displayedYear}
                onChange={handleYearChange}
                min="1900"
                max="2100"
                className="h-7 w-16 rounded-md border border-border bg-background px-1.5 text-center text-xs font-medium text-foreground outline-none focus:border-primary"
                placeholder="Year"
              />
            </div>

            {dateRange?.from && (
              <button
                type="button"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
                className="ml-1 text-[11px] font-semibold text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          numberOfMonths={isMobile ? 1 : 2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
