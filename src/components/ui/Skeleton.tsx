'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const base = 'animate-pulse bg-white/[0.06] rounded';
  const variantClass = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return <div className={`${base} ${variantClass[variant]} ${className}`} />;
}

export function PostSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-4" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="w-16 h-8" variant="rectangular" />
        <Skeleton className="w-16 h-8" variant="rectangular" />
        <Skeleton className="w-16 h-8" variant="rectangular" />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-28 h-4" />
        <Skeleton className="w-44 h-3" />
      </div>
      <Skeleton className="w-10 h-3" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] space-y-3">
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-1/2 h-4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="w-16 h-6" variant="rectangular" />
        <Skeleton className="w-16 h-6" variant="rectangular" />
      </div>
    </div>
  );
}
