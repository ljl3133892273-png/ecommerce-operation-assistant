import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  /**
   * 页头内容（通常放 <PageHeader />）。
   * 传入后会渲染成一条通栏的独立色带，与内容区分离；
   * 不传则退化为「只有内容区」的两段式，兼容历史页面。
   */
  header?: ReactNode;
  /** default 为工作台宽度，narrow 用于单列场景。 */
  width?: "default" | "narrow";
};

/** 用 1400px 而非 Tailwind 默认的 max-w-7xl(1280px)：商品池 6 列、复盘表 8 列，需要更宽。 */
const widthClass = {
  default: "max-w-[1400px]",
  narrow: "max-w-5xl",
};

/**
 * 页面外壳：三段式结构 —— 全局顶栏（在 layout 里）/ 页头带 / 内容区。
 * 用 flex-1 而不是 min-h-screen，这样配合顶部导航时不会多出一条永久滚动条；
 * 若外层不是 flex 容器，flex-1 会被忽略，不影响单独使用。
 */
export function PageShell({ children, header, width = "default" }: PageShellProps) {
  return (
    <main className="flex flex-1 flex-col bg-canvas text-ink">
      {header ? (
        <div className="border-b border-line bg-surface">
          <div className={`mx-auto w-full px-5 py-5 lg:px-8 ${widthClass[width]}`}>{header}</div>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col px-5 py-6 lg:px-8">
        <div className={`mx-auto flex w-full flex-1 flex-col gap-6 ${widthClass[width]}`}>{children}</div>
      </div>
    </main>
  );
}

/** 居中单卡片外壳，用于登录页等全屏提示场景。 */
export function CenteredShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10 text-ink">
      {children}
    </main>
  );
}
