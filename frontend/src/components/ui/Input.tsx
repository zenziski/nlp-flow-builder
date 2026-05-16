import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border text-sm text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/25 focus:border-[var(--brand)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[#b9382f]' : 'border-[#e4cfc4]'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-[#b9382f]">{error}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
export default Input;
