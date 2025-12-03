import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-medium text-neutral-700 mb-16 uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-pink-600 ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-6 py-8 rounded-2xl border text-[13px] transition-colors duration-200 bg-yellow-300',
            'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent',
            'placeholder:text-neutral-400',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-neutral-300 hover:border-neutral-400',
            props.disabled && 'bg-neutral-100 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-3 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
