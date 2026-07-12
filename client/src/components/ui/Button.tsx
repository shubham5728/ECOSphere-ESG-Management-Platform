import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({ loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white
        transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
