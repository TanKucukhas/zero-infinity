type CheckboxProps = {
  label?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ label, error, className, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className={`h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-600 dark:border-zinc-600 dark:bg-zinc-900 ${error ? "border-red-500" : ""} ${className || ""}`}
        {...props}
      />
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
