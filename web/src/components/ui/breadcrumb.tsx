import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
  label: ReactNode;
  /** 省略 href 表示这是当前位置，不可点击。 */
  href?: string;
};

/**
 * 面包屑：显示「你在哪儿」的路径，前几级可点，最后一级是当前位置。
 * 用于商品详情 / 店铺详情 / 生成任务详情这类深层页面，避免只能靠浏览器后退。
 */
export function Breadcrumb({ items, className = "" }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="面包屑" className={`flex flex-wrap items-center gap-1.5 text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-soft" aria-hidden="true" />
            ) : null}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-brand hover:text-brand-hover hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-ink" : "text-ink-muted"}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
