interface SkeletonProps {
  variant?: 'text' | 'card' | 'table-row' | 'stat-card' | 'product-card' | 'circle';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export default function Skeleton({ variant = 'text', width, height, className = '', count = 1 }: SkeletonProps) {
  const base = 'animate-pulse bg-slate-200 rounded-lg';

  const variants: Record<string, string> = {
    'text': 'h-4 w-full',
    'card': 'h-32 w-full rounded-xl',
    'table-row': 'h-14 w-full',
    'stat-card': 'h-24 w-full rounded-xl',
    'product-card': 'h-64 w-full rounded-xl',
    'circle': 'h-10 w-10 rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${base} ${variants[variant]} ${className}`}
          style={style}
        />
      ))}
    </>
  );
}
