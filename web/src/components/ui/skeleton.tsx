/** 骨架块：路由切换或数据加载期间占位，避免白屏。 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-control bg-line ${className}`} aria-hidden="true" />;
}

/** 成组的骨架卡片，用于指标区等重复结构。 */
export function SkeletonCards({ count = 4, className = "h-20" }: { count?: number; className?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={className} />
      ))}
    </div>
  );
}
