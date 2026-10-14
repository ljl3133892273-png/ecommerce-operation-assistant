import type { ReactNode } from "react";

/** 单行输入/下拉框的统一类名，替代各表单里复制粘贴的 focus:ring-4 长串。 */
export const controlClass =
  "h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-muted disabled:text-ink-soft";

/** 多行文本域的统一类名。 */
export const textareaClass =
  "min-h-24 w-full resize-y rounded-control border border-line bg-surface px-3 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-muted";

/** 紧凑型控件（工具栏、筛选条内使用）。 */
export const controlCompactClass =
  "h-9 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-muted disabled:text-ink-soft";

type FieldProps = {
  label: ReactNode;
  /** 字段说明或错误提示，显示在控件下方。 */
  hint?: ReactNode;
  /** 控件本身，通常直接放 <input /> / <select /> / <textarea />。 */
  children: ReactNode;
  className?: string;
};

/** 表单字段：统一 label 排版与间距。控件类名请用 controlClass / textareaClass。 */
export function Field({ label, hint, children, className = "" }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-ink-muted">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1.5 text-xs leading-5 text-ink-soft">{hint}</p> : null}
    </label>
  );
}
