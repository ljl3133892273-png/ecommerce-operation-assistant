import type { ReactNode } from "react";

type BadgeTone = "neutral" | "solid" | "brand" | "success" | "warning" | "danger" | "info";

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  /** 深色实心标签，用于需要最强视觉重量的标识（如当前 Workspace） */
  solid: "bg-solid text-white",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

const sizeClass = {
  sm: "h-6 px-2 text-xs",
  md: "h-7 px-2.5 text-xs",
};

type BadgeProps = {
  tone?: BadgeTone;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
};

/** 状态标签：把「完成/正常/待办/失败」等语义集中到 tone 上，不再各页面自选颜色。 */
export function Badge({ tone = "neutral", size = "md", className = "", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-control font-medium ${toneClass[tone]} ${sizeClass[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/** 纯展示用的数据小标签，例如商品卖点，比 Badge 更轻。 */
export function Tag({ tone = "brand", className = "", children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-control px-2 py-1 text-xs ${toneClass[tone]} ${className}`}>
      {children}
    </span>
  );
}
