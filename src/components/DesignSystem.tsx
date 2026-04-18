import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'coral' | 'ink';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isBlock?: boolean;
  }
>(({ className, variant = 'primary', size = 'md', isBlock, ...props }, ref) => {
  const variants = {
    primary: 'bg-racha-lime text-black font-semibold hover:opacity-90',
    secondary: 'bg-border text-white font-semibold hover:bg-border/80',
    ghost: 'bg-transparent text-white hover:bg-white/5',
    coral: 'bg-racha-coral text-white font-semibold hover:opacity-90',
    ink: 'bg-bg-sunk text-white border border-border hover:bg-bg-elev',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-md',
    md: 'px-5 py-2.5 text-sm rounded-lg',
    lg: 'px-7 py-3 text-base rounded-xl',
    icon: 'p-2.5 w-10 h-10 flex items-center justify-center rounded-lg',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 uppercase tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border-none outline-none',
        variants[variant],
        sizes[size],
        isBlock && 'w-full',
        className
      )}
      {...props}
    />
  );
});

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }
>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="grid gap-1.5 w-full">
      {label && (
        <label className="font-sans text-[11px] uppercase tracking-[1px] text-racha-sand px-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full bg-bg-sunk border border-border rounded-lg px-4 py-3 font-sans font-medium text-white focus:outline-none focus:border-racha-lime/50 transition-all placeholder:text-white/20',
          error && 'border-racha-coral',
          className
        )}
        {...props}
      />
      {error && <span className="text-[10px] font-bold text-racha-coral uppercase px-1">{error}</span>}
    </div>
  );
});

export const Card = ({ children, className, variant = 'elevated' }: { children: React.ReactNode, className?: string, variant?: 'elevated' | 'flat' | 'sunken' | 'ink' }) => {
  const variants = {
    elevated: 'bg-bg-elev border border-border shadow-card',
    flat: 'bg-transparent border border-border',
    sunken: 'bg-bg-sunk border border-border/50',
    ink: 'bg-bg border border-white/5',
  };

  return (
    <div className={cn('rounded-xl p-5', variants[variant], className)}>
      {children}
    </div>
  );
};

export const SectionHeader = ({ title, eyebrow, count }: { title: string, eyebrow?: string, count?: string | number }) => (
  <div className="mb-6 flex items-end justify-between">
    <div className="flex flex-col">
      {eyebrow && (
        <span className="font-sans text-[11px] uppercase tracking-[1px] text-racha-lime mb-1">{eyebrow}</span>
      )}
      <h2 className="text-xl font-bold tracking-tight text-white leading-none">
        {title}
      </h2>
    </div>
    {count !== undefined && (
      <span className="bg-border text-white text-[10px] px-2 py-1 rounded font-bold">
        {count}
      </span>
    )}
  </div>
);

export const Chip = ({ children, variant = 'default', active, className, ...props }: { children: React.ReactNode, variant?: 'default' | 'live' | 'ink' | 'colored', active?: boolean } & React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
        variant === 'default' && (active ? 'bg-accent-dim text-racha-lime border-l-2 border-racha-lime' : 'bg-border text-racha-sand'),
        variant === 'live' && 'bg-racha-coral/10 text-racha-coral border border-racha-coral/20',
        variant === 'ink' && 'bg-white text-black',
        variant === 'colored' && 'bg-border/50 text-white border border-border',
        className
      )}
      {...props}
    >
      {variant === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-racha-coral animate-pulse" />}
      {children}
    </span>
  );
};
