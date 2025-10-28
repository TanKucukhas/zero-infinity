"use client";
import { ReactNode } from 'react';

interface TableContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  actions?: ReactNode;
}

export default function TableContainer({ 
  children, 
  title, 
  description, 
  count, 
  countLabel = "items",
  actions 
}: TableContainerProps) {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 ml-6">
            {count !== undefined && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                {count} {countLabel}
              </div>
            )}
            {actions}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
