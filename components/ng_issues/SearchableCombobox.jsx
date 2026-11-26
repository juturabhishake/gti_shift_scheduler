'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function SearchableCombobox({
  options = [],
  value = '',
  onChange,
  placeholder = 'Search by ID or Name…',
  disabled = false,
}) {
  const inputId = useId();
  const listId = useId();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedUser = options.find((u) => u.EmployeeId === value) ?? null;

  const inputDisplay = open
    ? query
    : selectedUser
      ? `${selectedUser.EmployeeId} - ${selectedUser.Username}`
      : '';

  const filtered = query.trim()
    ? options.filter((u) => {
        const q = query.toLowerCase();
        return (
          u.EmployeeId?.toLowerCase().includes(q) ||
          u.Username?.toLowerCase().includes(q)
        );
      })
    : options;

  const openList = useCallback(() => {
    if (!disabled) {
      setOpen(true);
      setActiveIndex(-1);
    }
  }, [disabled]);

  const closeList = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeList();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [closeList]);

  useEffect(() => {
    if (open && activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex];
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIndex]);

  function handleKeyDown(e) {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          openList();
          return;
        }
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;

      case 'Enter':
        e.preventDefault();
        if (open && activeIndex >= 0 && filtered[activeIndex]) {
          selectUser(filtered[activeIndex]);
        } else {
          openList();
        }
        break;

      case 'Escape':
        closeList();
        break;

      case 'Tab':
        if (open) closeList();
        break;

      default:
        break;
    }
  }

  function selectUser(user) {
    onChange?.(user);
    closeList();
  }

  function clearSelection(e) {
    e.stopPropagation();
    onChange?.(null);
    setQuery('');
    inputRef.current?.focus();
  }

  function handleInputChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={[
          'flex items-center rounded-md border px-2.5 py-1.5',
          'bg-white dark:bg-gray-900',
          disabled
            ? 'cursor-not-allowed opacity-50 border-gray-200 dark:border-gray-700'
            : 'border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          value={inputDisplay}
          onChange={handleInputChange}
          onFocus={openList}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className={[
            'min-w-0 flex-1 bg-transparent text-sm outline-none',
            'text-gray-800 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            disabled ? 'cursor-not-allowed' : '',
          ].join(' ')}
        />

        {selectedUser && !disabled && (
          <button
            type="button"
            onClick={clearSelection}
            tabIndex={-1}
            className="ml-1 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <ChevronDown
          className={[
            'ml-1 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-150',
            open ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={[
            'absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md shadow-lg',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'py-1 text-sm',
          ].join(' ')}
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-2 text-gray-400 dark:text-gray-500 select-none">
              No matches found
            </li>
          ) : (
            filtered.map((user, idx) => {
              const isSelected = user.EmployeeId === value;
              const isActive = idx === activeIndex;

              return (
                <li
                  key={user.EmployeeId}
                  id={`${listId}-option-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectUser(user);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={[
                    'flex cursor-pointer flex-col px-4 py-1.5',
                    isActive ? 'bg-blue-50 dark:bg-blue-900/40' : '',
                    isSelected ? 'font-medium' : '',
                    !isActive ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : '',
                  ].join(' ')}
                >
                  <span
                    className={
                      isSelected
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-800 dark:text-gray-100'
                    }
                  >
                    {user.EmployeeId} – {user.Username}
                  </span>
                  {(user.Position || user.Department) && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {[user.Position, user.Department].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
