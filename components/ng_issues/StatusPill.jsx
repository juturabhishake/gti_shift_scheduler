'use client';

import React from 'react';

const STATUS_MAP = {
  Closed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Open: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Terminated: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  Submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  Solved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const DEFAULT_CLASSES = 'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300';

const SIZE_MAP = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function StatusPill({ status, size = 'sm' }) {
  const colorClasses = STATUS_MAP[status] ?? DEFAULT_CLASSES;
  const sizeClasses = SIZE_MAP[size] ?? SIZE_MAP.sm;

  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium leading-none',
        colorClasses,
        sizeClasses,
      ].join(' ')}
    >
      {status ?? '—'}
    </span>
  );
}
