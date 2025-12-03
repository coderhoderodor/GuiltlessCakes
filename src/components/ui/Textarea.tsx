import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[11px] font-medium text-neutral-700 mb-5 uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-pink-600 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full px-6 py-6 rounded-2xl border text-[12px] transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent',
            'placeholder:text-neutral-400 resize-y min-h-[180px] leading-relaxed',
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

Textarea.displayName = 'Textarea';

export { Textarea };
