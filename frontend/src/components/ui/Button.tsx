import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: 'bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-white border-[var(--brand)] shadow-[0_14px_28px_-18px_rgba(211,90,47,0.95)]',
  secondary: 'bg-white/80 hover:bg-white text-slate-800 border-[#e7cdbf]',
  ghost: 'bg-transparent hover:bg-[#fff0e7] text-slate-700 border-transparent',
  danger: 'bg-[#b9382f] hover:bg-[#9b2f28] text-white border-[#b9382f] shadow-[0_14px_28px_-18px_rgba(155,47,40,0.95)]',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/35
        active:translate-y-[1px]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
