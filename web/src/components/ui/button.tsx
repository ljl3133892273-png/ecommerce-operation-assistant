import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  /** 主操作：新建、生成、保存。全站唯一的主操作色（brand 深青绿） */
  primary: "bg-brand text-white hover:bg-brand-hover",
  /** 描边次要操作：查看、切换、下载 */
  secondary: "border border-line bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink",
  /** 无边框操作：次级入口、取消 */
  ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
  /** 破坏性操作：取消任务、拒绝 */
  danger: "border border-danger/30 bg-surface text-danger hover:bg-danger-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3 text-sm",
  lg: "h-11 px-4 text-sm",
};

/**
 * 生成按钮类名。同时导出给 <Link>、<a>、<summary> 使用，
 * 保证「按钮样式」在全站只有一个来源。
 */
export function buttonClass(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return [base, variants[variant], sizes[size], extra].filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

/** 主操作按钮组件，类名统一来自 buttonClass，不需要各处手写长类串。 */
export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
