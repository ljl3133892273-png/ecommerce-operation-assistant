import type { ReactNode } from "react";

type PageHeaderProps = {
  /** 面包屑，放在标题上方；详情页用，一级页面不传。 */
  breadcrumb?: ReactNode;
  /** 标题上方的小字标识，通常放模块英文名或所属平台/类目。 */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 标题下方的自定义区块，例如指标卡片、状态标签组。 */
  meta?: ReactNode;
  /** 右侧操作区。 */
  actions?: ReactNode;
  className?: string;
};

/**
 * 页面头。由 <PageShell header={...}> 渲染成通栏色带，
 * 因此这里**不再自带 border-b / pb**，分隔由色带统一提供，避免双线。
 */
export function PageHeader({
  breadcrumb,
  eyebrow,
  title,
  description,
  meta,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${className}`}>
      <div className="min-w-0">
        {breadcrumb ? <div className="mb-3">{breadcrumb}</div> : null}
        {eyebrow ? <p className="text-sm font-medium text-brand">{eyebrow}</p> : null}
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">{description}</p> : null}
        {meta ? <div className="mt-3">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
