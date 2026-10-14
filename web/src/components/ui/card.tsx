import type { ReactNode } from "react";

export type TileTone = "solid" | "brand" | "success" | "warning" | "danger" | "info";

const tileToneClass: Record<TileTone, string> = {
  /** 深色实心底座，用于页面主图标位 */
  solid: "bg-solid text-white",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

/** 方形图标底座，用于页面头、区块标题左侧的图标位。 */
export function IconTile({
  tone = "solid",
  size = "md",
  children,
}: {
  tone?: TileTone;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  const sizeClass = {
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-control ${sizeClass} ${tileToneClass[tone]}`}>
      {children}
    </div>
  );
}

type CardProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  /** 便于面包屑或站内锚点直接定位到某张卡片，配合 scroll-mt-24 使用。 */
  id?: string;
};

/** 卡片容器：统一圆角、描边和底色，替换各页面手写的 border + rounded + bg-white 组合。 */
export function Card({ children, className = "", padded = true, id }: CardProps) {
  return (
    <div id={id} className={`rounded-card border border-line bg-surface shadow-card ${padded ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

type SectionTitleProps = {
  icon?: ReactNode;
  tone?: TileTone;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** 区块标题行：图标 + 标题 + 说明 + 右侧操作，全站统一间距与字号。 */
export function SectionTitle({ icon, tone = "brand", title, description, actions, className = "" }: SectionTitleProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {icon ? (
          <IconTile tone={tone}>
            {icon}
          </IconTile>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
