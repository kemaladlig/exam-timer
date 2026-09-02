import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-transparent',
      secondary: 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/90 shadow-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800',
      danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-900/60',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-zinc-800 dark:text-zinc-300',
      accent: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-medium',
      md: 'px-4 py-2.5 text-sm font-semibold',
      lg: 'px-6 py-3.5 text-base font-semibold',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
