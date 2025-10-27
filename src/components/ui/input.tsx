type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, helperText, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-zinc-300"} ${className || ""}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>}
    </div>
  );
}
