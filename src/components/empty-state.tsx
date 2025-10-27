"use client";
import { Upload, Search, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  type: "no-data" | "no-results" | "error";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
};

export default function EmptyState({ 
  type, 
  title, 
  description, 
  action, 
  secondaryAction 
}: EmptyStateProps) {
  const icons = {
    "no-data": Upload,
    "no-results": Search,
    "error": AlertCircle,
  };

  const Icon = icons[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <Icon className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "primary"}
            className="min-w-[120px]"
          >
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            className="min-w-[120px]"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Predefined empty states
export function NoPeopleEmptyState({ onImport }: { onImport: () => void }) {
  return (
    <EmptyState
      type="no-data"
      title="No people data yet"
      description="Get started by importing your first CSV file or adding people manually."
      action={{
        label: "Import CSV",
        onClick: onImport,
        variant: "primary",
      }}
      secondaryAction={{
        label: "Add Person",
        onClick: () => {}, // TODO: Implement add person
      }}
    />
  );
}

export function NoSearchResultsEmptyState({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <EmptyState
      type="no-results"
      title="No results found"
      description="Try adjusting your search criteria or filters to find what you're looking for."
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "outline",
      }}
    />
  );
}

export function ErrorEmptyState({ 
  onRetry, 
  error 
}: { 
  onRetry: () => void;
  error?: string;
}) {
  return (
    <EmptyState
      type="error"
      title="Something went wrong"
      description={error || "An unexpected error occurred. Please try again."}
      action={{
        label: "Try Again",
        onClick: onRetry,
        variant: "primary",
      }}
    />
  );
}



