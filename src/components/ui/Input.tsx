'use client';

import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      inputVariant: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500',
      },
      inputSize: {
        default: 'h-10',
        sm: 'h-8 px-2 text-xs',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      inputVariant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    inputVariant,
    inputSize,
    type = 'text',
    leftIcon,
    rightIcon,
    error,
    success,
    warning,
    helperText,
    label,
    required,
    showPasswordToggle,
    fullWidth = false,
    startAdornment,
    endAdornment,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : inputVariant;
    const inputType = showPasswordToggle && showPassword ? 'text' : type;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {startAdornment && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startAdornment}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              inputVariants({ inputVariant: currentVariant, inputSize }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              showPasswordToggle && 'pr-10',
              startAdornment && 'pl-10',
              endAdornment && 'pr-10',
              fullWidth && 'w-full',
              isFocused && 'ring-2 ring-ring ring-offset-2',
              hasValue && 'border-primary',
              className
            )}
          />

          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}

          {endAdornment && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endAdornment}
            </div>
          )}

          {showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {/* Status icons */}
          {currentVariant === 'success' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <Check size={16} />
            </div>
          )}

          {currentVariant === 'error' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
              <X size={16} />
            </div>
          )}

          {currentVariant === 'warning' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500">
              <AlertCircle size={16} />
            </div>
          )}
        </div>

        {/* Helper text */}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p id={errorId} className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}

        {/* Success message */}
        {success && !error && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <Check size={14} />
            {success}
          </p>
        )}

        {/* Warning message */}
        {warning && !error && (
          <p className="text-sm text-yellow-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {warning}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Input group component for related inputs
interface InputGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  children,
  orientation = 'vertical',
  className,
}) => {
  const orientationClasses = orientation === 'horizontal'
    ? 'flex flex-row space-x-2'
    : 'space-y-4';

  return (
    <div className={cn(orientationClasses, className)}>
      {children}
    </div>
  );
};

export { Input, InputGroup, inputVariants };