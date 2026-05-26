'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, iconRight, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5
              text-sm text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${iconRight ? 'pr-10' : ''}
              ${error ? 'border-red-500/50 focus:ring-red-500/40' : ''}
              ${className}
            `}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
