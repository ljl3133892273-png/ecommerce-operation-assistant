import type { ReactNode } from "react";

type EmptyStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** 可选图标。 */
  icon?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const paddingClass = {
  sm: "px-4 py-6",
  md: "px-4 py-10",
  lg: "px-4 py-12",
};

/** 空状态：统一虚线框、留白与文案层级，替代各页面手写的 dashed 提示块。 */
export function EmptyState({ title, description, actions, icon, className = "", size = "md" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-card border border-dashed border-line-strong text-center ${paddingClass[size]} ${className}`}
    >
      {icon ? <div className="text-ink-soft">{icon}</div> : null}
      {title ? <p className="text-sm font-medium text-ink-muted">{title}</p> : null}
      {description ? <p className="max-w-lg text-sm leading-6 text-ink-soft">{description}</p> : null}
      {actions ? <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div> : null}
    </div>
  );
}

type NoticeTone = "success" | "warning" | "danger" | "info";

const noticeToneClass: Record<NoticeTone, string> = {
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
  info: "border-info/20 bg-info-soft text-info",
};

/** 提示条：统一操作结果、权限提示、风险提示的视觉口径。 */
export function Notice({
  tone = "info",
  icon,
  children,
  className = "",
}: {
  tone?: NoticeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-card border px-4 py-3 text-sm ${noticeToneClass[tone]} ${className}`}>
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="min-w-0 flex-1 leading-6">{children}</div>
    </div>
  );
}
