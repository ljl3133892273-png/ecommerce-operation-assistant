import { PageShell } from "@/components/ui/page-shell";
import { Skeleton, SkeletonCards } from "@/components/ui/skeleton";

/**
 * 路由组级加载态：页面数据在服务端读取期间先渲染骨架，避免慢查询时整片白屏。
 * 骨架按三段式结构铺：页头带 → 指标条 → 内容卡片，和真实页面同构，减少切换跳动。
 */
export default function DashboardLoading() {
  return (
    <PageShell
      header={
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
      }
    >
      <SkeletonCards />

      <div className="rounded-card border border-line bg-surface shadow-card p-5">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>

      <Skeleton className="h-56 rounded-card" />

      <span className="sr-only" role="status">
        正在加载页面数据
      </span>
    </PageShell>
  );
}
