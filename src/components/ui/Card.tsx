'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-5',
  lg: 'p-5 md:p-6',
};

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl
        ${hover ? 'cursor-pointer transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-0.5' : ''}
        ${glow ? 'shadow-lg shadow-indigo-500/5' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
