import type { CSSProperties, ReactNode } from "react";

/**
 * 表格列宽用 CSS 变量传递：
 *   columns={{ columns: "1.2fr 0.7fr 0.6fr 1.1fr 1fr" }}
 * 小屏回落为单列堆叠（display:grid 默认单列），lg 断点才铺开成多列。
 */
type TableColumns = { columns: string };

function columnsStyle(columns: string): CSSProperties {
  return { "--table-cols": columns } as CSSProperties;
}

/** 表格外框：统一圆角、描边与溢出裁切。 */
export function TableShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-card border border-line bg-surface shadow-card ${className}`}>{children}</div>;
}

type TableHeadProps = TableColumns & {
  /** 与表体列一一对应的表头文字。 */
  labels: ReactNode[];
  className?: string;
};

/** 表头：小屏隐藏，lg 起按 columns 定义铺开。 */
export function TableHead({ columns, labels, className = "" }: TableHeadProps) {
  return (
    <div
      className={`hidden items-center bg-surface-muted px-4 py-3 text-xs font-semibold text-ink-muted lg:grid lg:grid-cols-[var(--table-cols)] lg:gap-3 ${className}`}
      style={columnsStyle(columns)}
    >
      {labels.map((label, index) => (
        <span key={index}>{label}</span>
      ))}
    </div>
  );
}

type TableRowProps = TableColumns & {
  children: ReactNode;
  className?: string;
};

/** 表体行：小屏纵向堆叠，lg 起按同一份 columns 对齐表头。 */
export function TableRow({ columns, children, className = "" }: TableRowProps) {
  return (
    <div
      className={`grid gap-2 px-4 py-4 text-sm lg:min-h-16 lg:grid-cols-[var(--table-cols)] lg:items-center lg:gap-3 lg:py-3 ${className}`}
      style={columnsStyle(columns)}
    >
      {children}
    </div>
  );
}

/** 表格内的数据行分隔线容器。 */
export function TableBody({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-line">{children}</div>;
}
